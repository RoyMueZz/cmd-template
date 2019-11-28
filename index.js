#!/usr/bin/env node

const fs = require('fs')
const program = require('commander')
const download = require('download-git-repo')
const inquirer = require('inquirer')
const handlebars = require('handlebars')
const ora = require('ora')
const chalk = require('chalk')
const logSymbols = require('log-symbols')

program.version('0.1.0')

// 这里写入github上的模板
const templates = {
  blogSourceCode: {
    url: 'https://github.com/RoyMueZz/-blogSourceCode',
    downloadUrl: 'https://github.com:RoyMueZz/-blogSourceCode#master',
    description: 'blogSourceCode github',
  },
  folder: {
    url: 'https://github.com/RoyMueZz/folder',
    downloadUrl: 'http://github.com:RoyMueZz/folder#master',
    description: 'folders github',
  },
}

program
  .command('init <template> <project>')
  .description('初始化项目模板')
  .action((templateName, projectName) => {
    const spinner = ora('正在下载模板...').start()
    const { downloadUrl } = templates[templateName]
    download(downloadUrl, projectName, { clone: true }, err => {
      if (err) {
        spinner.fail()
        return console.log(logSymbols.error, chalk.red('初始化模板失败'))
      }
      spinner.succeed()
      // 命令行交互的逻辑
      inquirer
        .prompt([
          {
            type: 'input',
            name: 'name',
            message: '请输入项目名称',
          },
          {
            type: 'input',
            name: 'description',
            message: '请输入项目简介',
          },
          {
            type: 'input',
            name: 'author',
            message: '请输入作者名称',
          },
        ])
        .then(answers => {
          const packagePath = `${projectName}/package.json`
          const packageContent = fs.readFileSync(packagePath, 'utf8')
          const packageResult = handlebars.compile(packageContent)(answers)
          fs.writeFileSync(packagePath, packageResult)
          console.log(logSymbols.success, chalk.green('初始化模板成功'))
        })
    })
  })
program
  .command('list')
  .description('查看所有可用模板')
  .action(() => {
    for (const key in templates) {
      console.log(`
        ${key}    ${templates[key].description}
      `)
    }
  })

program
  .command('exec <cmd>')
  .alias('ex')
  .description('execute the given remote cmd')
  .option('-e, --exec_mode <mode>', 'Which exec mode to use')
  .action(function(cmd, options) {
    console.log('exec "%s" using %s mode', cmd, options.exec_mode)
  })
  .on('--help', function() {
    console.log('')
    console.log('Examples:')
    console.log('')
    console.log('  $ deploy exec sequential')
    console.log('  $ deploy exec async')
  })

program.command('*').action(function(env) {
  console.log('deploying "%s"', env)
})

program.parse(process.argv)
