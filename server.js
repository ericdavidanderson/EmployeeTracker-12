//dependencies
const mysql = require("mysql");
const inquirer = require("inquirer");
const { extensions } = require("sequelize/types/lib/utils/validator-extras");


//mysql connection (database)
const connection = mysql.createConnection({
  host: "localhost",
  port: 3301,
  user: "root",
  password: "MAGic9277$#pass",
  database: 'employeeTracker_db'
});

connection.connect(function(err){

    if (err) throw err;
    prompt();
});

const cliPrompt = [
    {
        name: "action",
        type: "list",
        message: "Select and action",
        choices: [
            'View employees',
            'View roles',
            'View departments',
            'Add departments',
            'Add roles',
            'Add employees',
            'Edit employees',
            'Remove employees',
            'Exit'
        ]

    }
];


function prompt() {
    inquirer.prompt(cliPrompt)

    .then(function(answer) {
        if(answer.action =="View employees") {
            viewAll();
        }else if(answer.action == "View departments") {
            viewDepts();
        }else if(answer.action == "View roles") {
            viewRoles();
        }else if(answer.action == "Add employees") {
            addEmployees();
        }else if(answer.action == "Add departments") {
            addDepts();
        }else if(answer.action == "Add roles") {
            addRoles();
        }else if(answer.action == "Edit employees") {
            editEmployees();
        }else if(answer.action == "Remove employees") {
            deleteEmployees();
        }else if(answer.action == "Exit") {
            exit();
        };

    });
};


