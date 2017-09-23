#!/usr/bin/env node

'use strict'

const meow = require('meow')
const ora = require('ora')
const emailChk = require('email-chk')

const cli = meow(`
    Usage
      $ email-chk <email>

    Options
      timeout - Timeout in ms
      host    - Domain of originating smtp server
      from    - Email originating the request 

    Examples
      $ email-chk noreply@github.com
        
`, {
    alias: {
      t: 'timeout',
      h: 'host',
      f: 'from'
    }
  })

const email = cli.input[0]
if (typeof email !== 'string') {
  console.error('No email was provided to check')
  process.exit(1)
}

const options = {}
if (cli.flags.f) { options.from = cli.flags.f }
if (cli.flags.t) { options.timeout = cli.flags.t }
if (cli.flags.h) { options.host = cli.flags.h }

const spinner = ora(`Checking ${email}`).start()

emailChk(email, options)
  .then(exists => {
    if (exists) {
      spinner.succeed(`${email} is valid`)
    } else {
      spinner.fail(`${email} is invalid`)
    }
  })
  .catch(error => {
    let message
    if (~error.message.indexOf('Timeout')) {
      message = `Timeout expired while validating ${email}. Please try again.`
    } else {
      message = `An error occurred while validating ${email}. ${error}`
    }

    spinner.warn(message)
  })
