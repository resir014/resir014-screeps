import { ENABLE_DEBUG_MODE } from '../../config/config'
import { log, LogLevel } from '../../utils/logger'

import { Harvester } from './roles/harvester'
import { Hauler } from './roles/hauler'
import { Upgrader } from './roles/upgrader'
import { Builder } from './roles/builder'
import { Repairer } from './roles/repairer'
import { WallMaintainer } from './roles/wallMaintainer'
import { RoadMaintainer } from './roles/roadMaintainer'

// We use globals for these objects, so let's declare it.
declare const Orchestrator: IOrchestrator
declare const Inscribe: Inscribe

/**
 * Initialization scripts for CreepManager module.
 *
 * @export
 * @param {Room} room
 */
export function runCreeps(room: Room): void {
  const creeps: Creep[] = room.find<Creep>(FIND_MY_CREEPS)

  if (ENABLE_DEBUG_MODE) {
    const out = [
      `[${Inscribe.color('CreepManager', 'skyblue')}]`,
      `[${Inscribe.color(room.name, 'hotpink')}]`,
      `${_.size(creeps)} creep(s) found in the playground.`
    ]
    console.log(() => out.join(' '), { level: LogLevel.DEBUG })
  }

  // Builds missing creeps where necessary
  _manageCreeps(room, creeps)

  _.each(creeps, (creep: Creep) => {
    if (creep.memory.role === 'harvester') {
      const harvester = new Harvester(creep)
      harvester.run()
    }
    if (creep.memory.role === 'hauler') {
      const hauler = new Hauler(creep)
      hauler.run()
    }
    if (creep.memory.role === 'builder') {
      const builder = new Builder(creep)
      builder.run()
    }
    if (creep.memory.role === 'upgrader') {
      const upgrader = new Upgrader(creep)
      upgrader.run()
    }
    if (creep.memory.role === 'repairer') {
      const repairer = new Repairer(creep)
      repairer.run()
    }
    if (creep.memory.role === 'wallMaintainer') {
      const wallMaintainer = new WallMaintainer(creep)
      wallMaintainer.run()
    }
    if (creep.memory.role === 'roadMaintainer') {
      const roadMaintainer = new RoadMaintainer(creep)
      roadMaintainer.run()
    }
  })
}

function _manageCreeps(room: Room, creeps: Creep[]): void {
  const spawns: Spawn[] = room.find<Spawn>(FIND_MY_SPAWNS, {
    filter: (spawn: Spawn) => {
      return spawn.spawning === null
    },
  })

  // Iterate through each creep roles and push them into the assorted role object.
  const assortedCreeps: { [key: string]: Creep[] } = {
    harvesters: creeps.filter((creep: Creep) => creep.memory.role === 'harvester'),
    haulers: creeps.filter((creep: Creep) => creep.memory.role === 'hauler'),
    builders: creeps.filter((creep: Creep) => creep.memory.role === 'builder'),
    upgraders: creeps.filter((creep: Creep) => creep.memory.role === 'upgrader'),
    repairers: creeps.filter((creep: Creep) => creep.memory.role === 'repairer'),
    wallMaintainers: creeps.filter((creep: Creep) => creep.memory.role === 'wallMaintainer'),
    rampartMaintainers: creeps.filter((creep: Creep) => creep.memory.role === 'rampartMaintainer'),
    roadMaintainers: creeps.filter((creep: Creep) => creep.memory.role === 'roadMaintainer'),
    defenders: creeps.filter((creep: Creep) => creep.memory.role === 'defender'),
    mineralMiners: creeps.filter((creep: Creep) => creep.memory.role === 'mineralMiner')
  }

  for (const spawn of spawns) {
    let role: string
    let bodyParts: string[] = []

    if (ENABLE_DEBUG_MODE) {
      const out = [
        `[${Inscribe.color('CreepManager', 'skyblue')}]`,
        `[${Inscribe.color(room.name, 'hotpink')}]`,
        `Spawning from: ${spawn.name}`
      ]
      console.log(() => out.join(' '), { level: LogLevel.DEBUG })
    }

    // There needs to be at least two harvesters OR one haulers
    // before we prioritise spawning anything else. If not, we'll prioritise
    // spawning harvesters first.
    if (assortedCreeps.harvesters.length >= 1 || assortedCreeps.haulers.length > 1) {
      // We already have two harvesters.
      if (assortedCreeps.haulers.length < Memory.rooms[room.name].jobs.hauler) {
        // Create a new Hauler.
        role = 'hauler'
        bodyParts = Orchestrator.getBodyParts(role, spawn)
        _spawnCreep(spawn, bodyParts, role)
      } else if (assortedCreeps.harvesters.length < Memory.rooms[room.name].jobs.harvester) {
        // Create a new Harvester.
        role = 'harvester'
        bodyParts = Orchestrator.getBodyParts(role, spawn)
        _spawnCreep(spawn, bodyParts, role)
      } else if (assortedCreeps.upgraders.length < Memory.rooms[room.name].jobs.upgrader) {
        // Create a new Upgrader.
        role = 'upgrader'
        bodyParts = Orchestrator.getBodyParts(role, spawn)
        _spawnCreep(spawn, bodyParts, role)
      } else if (assortedCreeps.builders.length < Memory.rooms[room.name].jobs.builder) {
        // Create a new Builder.
        role = 'builder'
        bodyParts = Orchestrator.getBodyParts(role, spawn)
        _spawnCreep(spawn, bodyParts, role)
      } else if (assortedCreeps.repairers.length < Memory.rooms[room.name].jobs.repairer) {
        // Create a new Builder.
        role = 'repairer'
        bodyParts = Orchestrator.getBodyParts(role, spawn)
        _spawnCreep(spawn, bodyParts, role)
      } else if (assortedCreeps.wallMaintainers.length < Memory.rooms[room.name].jobs.wallMaintainer) {
        // Create a new Builder.
        role = 'wallMaintainer'
        bodyParts = Orchestrator.getBodyParts(role, spawn)
        _spawnCreep(spawn, bodyParts, role)
      } else if (assortedCreeps.roadMaintainers.length < Memory.rooms[room.name].jobs.roadMaintainer) {
        // Create a new Builder.
        role = 'roadMaintainer'
        bodyParts = Orchestrator.getBodyParts(role, spawn)
        _spawnCreep(spawn, bodyParts, role)
      }
    } else {
      // We don't have two harvesters yet.
      if (assortedCreeps.harvesters.length < Memory.rooms[room.name].jobs.harvester) {
        role = 'harvester'
        bodyParts = [WORK, WORK, MOVE, MOVE]
        _spawnCreep(spawn, bodyParts, role)
      } else if (assortedCreeps.haulers.length < Memory.rooms[room.name].jobs.hauler) {
        // Create a new Hauler.
        role = 'hauler'
        bodyParts = [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE]
        _spawnCreep(spawn, bodyParts, role)
      }
    }
  }
}

/**
 * Spawns a new creep.
 *
 * @param {Spawn} spawn
 * @param {string[]} bodyParts
 * @param {string} role
 * @returns
 */
function _spawnCreep(spawn: Spawn, bodyParts: string[], role: string): number {
  const guid: number = Orchestrator.getGuid()
  let status: number | string = spawn.canCreateCreep(bodyParts)

  const properties: { [key: string]: any } = {
    role,
    room: spawn.room.name,
  }

  if (ENABLE_DEBUG_MODE) {
    const out = [
      `[${Inscribe.color('CreepManager', 'skyblue')}]`,
      `[${Inscribe.color(spawn.name, 'hotpink')}]`,
      `Attempting to create new ${properties.role} in room ${properties.room}`
    ]
    console.log(() => out.join(' '), { level: LogLevel.DEBUG })
  }

  // `canCreateCreep()` returns a string instead of OK, so we handle a string
  // the same as if OK.
  status = _.isString(status) ? OK : status
  if (status === OK) {
    Memory.guid = guid + 1
    const creepName: string = `(${guid}) ${spawn.room.name} - ${role}`

    const creepCreateStarted = [
      `[${Inscribe.color('CreepManager', 'skyblue')}]`,
      `[${Inscribe.color(spawn.name, 'hotpink')}]`,
      `Started creating new creep: ${creepName}`
    ]
    log.debug(creepCreateStarted.join(' '), { level: LogLevel.INFO })
    if (ENABLE_DEBUG_MODE) {
      const outBody = [
        `[${Inscribe.color('CreepManager', 'skyblue')}]`,
        `[${Inscribe.color(spawn.name, 'hotpink')}]`,
        `Body: ${bodyParts}`
      ]
      const outGuid = [
        `[${Inscribe.color('CreepManager', 'skyblue')}]`,
        `[${Inscribe.color(spawn.name, 'hotpink')}]`,
        `guid: ${guid}`
      ]
      console.log(outBody.join(' '), { level: LogLevel.DEBUG })
      console.log(outGuid.join(' '), { level: LogLevel.DEBUG })
    }

    status = spawn.createCreep(bodyParts, creepName, properties)

    return _.isString(status) ? OK : status
  } else {
    if (ENABLE_DEBUG_MODE) {
      const out = [
        `[${Inscribe.color('CreepManager', 'skyblue')}]`,
        `[${Inscribe.color(spawn.name, 'hotpink')}]`,
        `Failed creating new creep: ${status}`
      ]
      console.log(() => out.join(' '), { level: LogLevel.ERROR })
    }

    return status
  }
}
