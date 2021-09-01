
//Important globals 

start_pos = "top" // bottom or top
mid_star = star_p89
energy_threshold = 30
me = "imnotender"
fallback = false
all_in = true
all_to_outpost = false
//-----------------------------------



//Define base and enemy stars based on spawn location
if (start_pos == "bottom") {
    base_star = star_a1c;
    enemy_star = star_zxq;
}

else if (start_pos == "top"){
    base_star = star_zxq;
    enemy_star = star_a1c
}

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

/* 12 initial spirits:
 0, 1 -> farmers
 1,2 -> scouts

*/

if (memory.i == null)
{
    memory.i = 0;
}

// INIT SPIRITS' ROLE
for (i = memory.i; i < my_spirits.length; i++){ 

  //my_spirits[i].move(my_spirits[6].position);
 //my_spirits[i].merge(my_spirits[6]);
  if ((i % 2) == 0) {
      my_spirits[i].set_mark("charging_base")
  }
  else {
      my_spirits[i].set_mark("attacking")
  }
  memory.i = i;
}

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

function charge_self(spirit) {
    spirit.set_mark("charging_self")
    if (spirit.last_energized != spirit.id) {
        if (base_star.energy >= 200) 
            spirit.move(base_star.position)
        else if (mid_star.energy >= 200)
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
        if(last_drained_star.energy > 200) {
            spirit.energize(spirit)
        }
        return
    }
    spirit.energize(spirit)
 
}

function charge_base(spirit) {
    spirit.set_mark("charging_base")
    if (spirit.energy <= energy_threshold) {
        charge_self(spirit)
    }
    if (spirit.last_energized != base.id)
        spirit.move(base.position)
    spirit.energize(base)
}

    
function attack(spirit) {
    spirit.set_mark("attacking")
    
    if (outpost.energy < 500) {
        if (spirit.last_energized != outpost.id) {
            spirit.move(outpost.position)
        }
        spirit.energize(outpost)
    }
    else {
        spirit.move(mid_star.position)
        spirit.energize(spirit)
    }
    
    if (spirit.energy <= energy_threshold) {
        retreat(spirit)
    }
    
    
    else {
        
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
}

//TODO: Spirit should lock in on weakest_spirit (only calling this once) until it's dead
function get_weakest_enemy(enemy_ids) {
    let weakest_enemy = null
    for (enemy_id of enemy_ids) {
        enemy = spirits[enemy_id]
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

//TODO: Substituir isto pela actual distancia (com fórmula da distanica e whatever)
//e devolver estrela cuja distancua é menor
function get_nearest_star(structure_ids) {
    //Safeguard for no nearby structs
    if (structure_ids.length == 0) 
        return base_star
        
    for (struct_id of structure_ids) {
        if (struct_id == outpost.id) 
            return mid_star
        else if (struct_id == base) 
            return base_star
        else if (struct_id == enemy_base)
            return enemy_star
        
    }
    //dirty way of doing things but can't think of anything better atm
    for (struct_id of structure_ids) {
        //Stars
        if (struct_id == base_star.id) 
            return base_star
        else if (struct_id == enemy_star.id) 
            return enemy_star
            
        else if (struct_id == mid_star.id && tick >= 200)
            return mid_star
    }
    //If we're still here spirit isn't near a star, let's try other structs

    return base_star
    }

//Charge to the base with all we got
if (all_in && true) {
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

    //Charging and guarding logic
    if (spirit.mark == "charging_base") {
        if (spirit.energy <= energy_threshold) {
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

    //-----------------------------------
    
    //Attacking logic
    else if (spirit.mark == "attacking") {
        if (spirit.energy <= energy_threshold) {
            retreat(spirit)
        }
        else {
            attack(spirit)
        }
    }
    else if (spirit.mark == "retreating") {
        if (spirit.energy == spirit.energy_capacity) {
            attack(spirit)
            
        }
        else {
            retreat(spirit)
        }
    }
    
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
        spirit.set_mark("charging_base")
        
    }
}



//Defend base when under attack
if (base.sight.enemies.length > 0) {
    target = get_weakest_enemy(base.sight.enemies)
    for (spirit in my_spirits) {
        if (spirit.mark == "charging_base" || spirit.mark == "charging_self" || true) {
            spirit.move(target.position)
            spirit.energize(target)
        }
    }
    
}
