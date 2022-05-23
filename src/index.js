#!/usr/bin/env node

import { program } from 'commander';
import path from 'node:path';
import os from 'node:os';
import enquirer from 'enquirer';
import { Store } from 'data-store';
import { NikeRunClub } from './api.js';

const settings = new Store({
  path: path.join(os.homedir(), '.config', 'nike-run-club-extractor', 'config.json')
})

const api = new NikeRunClub(settings)

program.version('1.0.0');

program
  .command('token')
  .description('Set token')
  .action(async () => {
    const input = await enquirer.prompt([
      {
        type: 'password',
        name: 'token',
        message: 'Access Token?',
        validate: (value) => {
          if (value === '') {
            return 'required'
          }

          return true
        }
      }
    ])

    settings.set({ token: input.token })
  });

program
  .command('credentials')
  .description('Set login credentials')
  .action(async () => {
    const credentials = await enquirer.prompt([
      {
        type: 'input',
        name: 'email',
        message: 'Email',
        validate: (value) => {
          if (value === '') {
            return 'Email required'
          }

          return true
        }
      },
      {
        type: 'password',
        name: 'password',
        message: 'Password',
        validate: (value) => {
          if (value === '') {
            return 'Password required'
          }

          return true
        }
      }
    ])

    settings.set({ credentials })
  });


program
  .command('manual-login')
  .description('Manual login')
  .action(async () => {
    await api.manualLogin()
  });

program
  .command('login')
  .description('Automatic login')
  .action(async () => {
    await api.login()
  });

program
  .command('activities')
  .argument('[afterId]')
  .description('List activities')
  .action(async (afterId) => {
    const response = await api.activities({ afterId })

    console.log(response)
  });

program
  .command('export-activities')
  .description('Export activities')
  .action(async () => {
    const store = new Store({ path: 'activities.json' })

    let afterId = null
    let activities = []

    do {
      const response = await api.activities({ afterId })

      console.log(`Found activities: ${response.activities.length}`)

      activities.push(...response.activities)

      afterId = response.paging?.after_id
    } while (afterId !== undefined)

    console.log(`Total activities: ${activities.length}`)

    store.set('activities', activities)
  });

program.parse(process.argv);