import { Config } from './../../config/config';

export namespace JobManager {

  export let harvesterJobs: number = 0;

  export const haulerJobs: number = 4; // not used yet.
  export const upgraderJobs: number = 4;
  export const builderJobs: number = 1;
  export const repairerJobs: number = 2;
  export const wallRepairerJobs: number = 2;

  export function load() {
    harvesterJobs = Config.MAX_HARVESTERS_PER_SOURCE;

    if (Config.VERBOSE) {
      console.log("JobManager loaded")
    }
  }

}