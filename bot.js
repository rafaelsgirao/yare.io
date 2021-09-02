me = "imnotender"
//Important globals 


attacking_threshold = 1/3
charging_threshold = 1/3

//replace this with minimum threshold and maximum threshold, so they don't keep switching
outpost_min_energy = 500
//
star_min_energy = 200
merge_attackers = false
merge_chargers = false
fallback = false
more_attackers = false //all spirits become #attacking after getting fully charged
all_out = false 
all_to_outpost = false

//-----------------------------------

//Define base and enemy stars based on spawn location
if (base.position == 2600, 1700) {
    console.log("a")
    base_star = star_a1c
    enemy_star = star_zxq
}

else if (base.position == 600,700) {
    console.log("b")
    base_star = star_zxq
    enemy_star = star_a1c
}

mid_star = star_p89

//TODO:
//Check if enemies in sight have more energy in total than friends in sight
//if our_energy < enemy_energy then retreat all 
//else attack


/*
Spirits can have three roles:
 - Guardian - orbit the base and attack approaching enemies
 - Scout - approach and energize outpost asap, attack approaching enemies
 - Harvester - collect and supply energy to base
 . Attacker - Attack enemy base
 
 TODO: would be nice if we could drain the enemy star so they run out of resources
*/

if (memory.i == null)
{
    neo = null
    memory.i = 0;
    
}


// INIT SPIRITS' ROLE
//TODO: convert this into dynamic spirit role manager (based on number of spirits
// in each role)
for (i = memory.i; i < my_spirits.length; i++){ 

  //my_spirits[i].move(my_spirits[6].position);
 //my_spirits[i].merge(my_spirits[6]);
  if ((i % 2) != 0) {
      my_spirits[i].set_mark("charging_base")
  }
  else {
      my_spirits[i].set_mark("attacking")
  }
  memory.i = i;
}


//-----------------------------------
//Role logic
function attack(spirit) {
    spirit.set_mark("attacking")
    
    if (spirit.energy <= attacking_threshold * spirit.energy_capacity) {
        retreat(spirit)
        return
    }
    
    if (outpost.energy < outpost_min_energy) {
        if (spirit.last_energized != outpost.id) {
            spirit.move(outpost.position)
        }
        spirit.energize(outpost)
    }
    else {
        spirit.move(mid_star.position)
        spirit.energize(spirit)
    }
    
    

    if (all_out && true) {
        
        spirit.move(enemy_base.position)
        spirit.energize(enemy_base)
    } 

}


function retreat() {
    spirit.set_mark("retreating")
   // console.log(spirit.id, spirit.last_energized)
    if (spirit.last_energized != spirit.id) {
        nearest_star = get_nearest_star(spirit.sight.structures)
        spirit.move(nearest_star.position)
    }
    spirit.energize(spirit)
    
    if (spirit.energy == spirit.energy_capacity) 
        attack(spirit);
}

function charge_self(spirit) {
    spirit.set_mark("charging_self")
    if (spirit.last_energized != spirit.id) {
        if (base_star.energy >= star_min_energy) 
            spirit.move(base_star.position)
        else if (mid_star.energy >= star_min_energy)
            spirit.move(mid_star.position)
        else {
            spirit.move(base.position)
        }
    }
    //TODO: convert this code to a function so it can be used here and on retreat()
    //TODO: Fix this code because spirits are still draining stars below 200 :(
    last_drained_star = get_star_by_id(spirit.last_energized)
    
    //Is only called if null, fix
    //console.log(last_drained_star)
    if (last_drained_star != null) {
        if(last_drained_star.energy > star_min_energy) {
            spirit.energize(spirit)
        }
        return
    }
    spirit.energize(spirit)
 
}

function charge_self(spirit) {
    spirit.set_mark("charging_self")
    if (spirit.last_energized != spirit.id) {
        if (base_star.energy >= star_min_energy) 
            spirit.move(base_star.position)
        else if (mid_star.energy >= star_min_energy)
            spirit.move(mid_star.position)
        else {
            spirit.move(base.position)
        }
    }
    //TODO: convert this code to a function so it can be used here and on retreat()
    //TODO: Fix this code because spirits are still draining stars below 200 :(
    last_drained_star = get_star_by_id(spirit.last_energized)
    
    //Is only called if null, fix
    //console.log(last_drained_star)
    if (last_drained_star != null) {
        if(last_drained_star.energy > star_min_energy) {
            spirit.energize(spirit)
        }
        return
    }
    spirit.energize(spirit)
 
}
//-----------------------------------
//Auxiliary functions

function get_star_by_id(id) {
    if (id == star_a1c.id) {
        return star_a1c
    }
    else if (id == star_p89.id) {
        return star_p89.id
    }
    else if (id == star_zxq.id){
        return star_zxq.id
    }
    else 
        return null
}

//TODO: Spirit should lock in on weakest_spirit (only calling this once) until it's dead
function get_weakest_enemy(enemy_ids) {
    let weakest_enemy = null
    for (enemy_id of enemy_ids) {
        enemy = spirits[enemy_id]
        return enemy //remove later if proved worse
        //console.log(enemy.energy);
        if (weakest_enemy == null) {
            weakest_enemy = enemy;
           // console.log(weakest_enemy.energy)
        }
            
        else if (enemy.energy < weakest_enemy.energy) 
            enemy = weakest_enemy;
    }
    return weakest_enemy;
}


function get_distance(pos1, pos2) {
    let x1, y1 = pos1
    let x2, y2 = pos2
    d = Math.sqrt((x1-x2)**2 + (y1-y2)**2)
}

//TODO: Substituir isto pela actual distancia (com fórmula da distanica e whatever)
//e devolver estrela cuja distancua é menor
function get_nearest_star(spirit) {
    //Distance to base star
    d_basestar = get_distance(spirit.position, base_star.position)
    
    d_enemystar = get_distance(spirit.position, enemy_star.position)
    
    d_midstar = get_distance(spirit.position, mid_star.position)
    
    if ((d_basestar < d_midstar)) //Spirit is between mid star and base
        return base_star
    else if (d_enemystar < d_midstar)
        return enemy_star
    else 
    return mid_star
    }


if (more_attackers && true) {
    for (spirit of my_spirits) {
        if (spirit.mark == "retreating") {
            
        }
        if (spirit.mark == "attacking") {
            spirit.move(enemy_base.position)
            spirit.energize(enemy_base)
        }
        if (spirit.mark == "charging_self") {
            //spirit.set_mark("attacking")
        }
        if (spirit.mark == "charging_base") {
            if (spirit.energy == spirit.energy_capacity )
                spirit.set_mark("attacking")
            else
                spirit.set_mark("retreating")
        }
            
    }
}

for (spirit of my_spirits) {
    if (spirit.hp == 0)
        continue
    
    //Charging and guarding logic
    if (spirit.mark == "charging_base") {
        if (spirit.energy <= charging_threshold * spirit.energy_capacity) {
            charge_self(spirit)
        }
        else {
            charge_base(spirit)
        }
    }
    else if (spirit.mark == "charging_self") {
        if (spirit.energy == spirit.energy_capacity) {
            charge_base(spirit)
        }
        else {
            charge_self(spirit);
        }
    }

    //Attacking logic
    else if (spirit.mark == "attacking") {
        if (merge_attackers == true) {
            if (neo == null)
                neo = spirit
            else if (neo == null || neo.hp == 0 || neo.size == 100)
        
                neo = spirit
            else
                spirit.move(neo.position)
                if (spirit != neo)
                    spirit.merge(neo)
        }
        else {
            attack(spirit)
        }
    }
        
        
    
    else if (spirit.mark == "retreating") 
        retreat(spirit)
        
    
    
    spirit.shout(spirit.mark)
    
    //Attack enemies on sight
    if (spirit.sight.enemies.length > 0 && spirit.mark != "retreating") {
        target = get_weakest_enemy(spirit.sight.enemies)

        spirit.move(target.position)
        spirit.energize(target)
    }
    
}


if (fallback && true) {
    for (spirit of my_spirits) {
        if (spirit.mark != "charging_base") 
            spirit.set_mark("charging_self")
        
    }
}



//Defend base when under attack
if (base.sight.enemies.length > 0) {
    target = get_weakest_enemy(base.sight.enemies)
    for (spirit of my_spirits) {
        if (spirit.mark == "charging_base" || spirit.mark == "charging_self" || true) {
            spirit.move(target.position)
            spirit.energize(target)
        }
    }
    
}

