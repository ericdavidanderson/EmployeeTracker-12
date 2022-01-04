//dependencies
const mysql = require("mysql2");
const inquirer = require("inquirer");
const PoolNamespace = require("mysql/lib/PoolNamespace");

require("dotenv").config();

//mysql connection (database)
const connection = mysql.createConnection({
  host: "localhost",

  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

const mPrompt = [
  {
    name: "action",
    type: "list",
    message: "Select and action",
    choices: [
      "View employees",
      "View roles",
      "View departments",
      "Add departments",
      "Add employees",
      "Add roles",
      "Edit employees",
      "Exit",
    ],
  },
];

function cliPrompt() {
  inquirer
    .prompt(mPrompt)

    .then(function (answer) {
      if (answer.action == "View employees") {
        viewAll();
      }
      if (answer.action == "Add roles") {
        addRole();
      } else if (answer.action == "View departments") {
        viewDepts();
      } else if (answer.action == "Add employees") {
        addEmployee();
      } else if (answer.action == "Add departments") {
        addDept();
      } else if (answer.action == "Edit employees") {
        editEmployees();
      }  else if (answer.action == "View roles") {
        viewRoles();
      } else if (answer.action == "Exit") {
        exit();
      }
    });
}

function viewAll() {
  var query = "SELECT * FROM employees";
  connection.query(query, function (err, res) {
    console.log(`all employees:`);
    res.forEach((employees) => {
      console.log(
        `ID: ${employees.id} | Name: ${employees.first_name} ${employees.last_name} | Role ID: ${employees.role_id} | Manager ID: ${employees.manager_id}`
      );
    });
    cliPrompt();
  });
}

function viewRoles() {
  var query = "SELECT * FROM roles";
  connection.query(query, function (err, res) {
    console.log(`all roles:`);
    res.forEach((roles) => {
      console.log(
        `ID: ${roles.id} | Title: ${roles.title}  | Salary: ${roles.salary} | department ID: ${roles.department_ID}`
      );
    });

    cliPrompt();
  });
}

function addEmployee() {
  connection.query("SELECT id,title from roles", function (err, res) {
    if (err) throw err;
    const roles = res.map(element=>element.title);
    inquirer
      .prompt([
        
        { 
          name: "first_name", type: "input", message: "first name?" 
        },
        {
          name: "last_name",
          type: "input",
          message: "last name?",
        },
        {
          name: "roles",
          type: "list",
          message: "What is the role title?",
          choices: roles
        }
      ]).then(answer =>{
        const newRole = res.find(element => {
          return element.title === answer.roles
        });
        const newHire ={
          first_name: answer.first_name,
          last_name: answer.last_name,
          role_id: newRole.id,
        };
        connection.query(
          "INSERT INTO employees SET ?",
          newHire,
          (err, success)=>{
            if (err) throw err;
            console.log(`${newHire.first_name} now in database`);
            cliPrompt();
          })
      })
    })

}

function addDept() {
  let query = "SELECT departments.dept_name FROM departments";
  console.log("department add");

  connection.query(query, function (err, res) {
    if (err) throw err;

    console.table(res);

    let addDeptPrompt = [
      {
        name: "new_department",
        type: "input",
        message: "Enter a new company department.",
      },
    ];
    inquirer
      .prompt(addDeptPrompt)

      .then(function (answer) {
        console.log(answer);
        let query = "INSERT INTO departments SET ?";

        connection.query(
          query,
          {
            dept_name: answer.new_department,
          },
          function (err, res) {
            if (err) throw err;
          }
        );

        let addAgainP = [
          {
            name: "again",
            type: "list",
            message: "Would you like to add another department?",
            choices: ["Yes", "Exit"],
          },
        ];

        inquirer
          .prompt(addAgainP)

          .then(function (answer) {
            let query = "SELECT departments.dept_name FROM departments";

            connection.query(query, function (err, res) {
              if (err) throw err;

              if (answer.again == "Yes") {
                addDept();
              } else if (answer.again == "Exit") {
                console.table(res);

                cliPrompt();
              }
            });
          });
      });
  });
}

function addRole() {
  connection.query("SELECT * FROM departments", function (err,res) {
    if (err) throw err;
    const department = res.map(element =>{
      return element.id
    })
    inquirer
      .prompt([
        {
          name: "title",
          type: "input",
          message: "What is the role title?",
        },
        {
          name: "salary",
          type: "input",
          message: "What salary does this role require?",
        },
        {
          name: "department_ID",
          type: "list",
          message: "Which department is this role in?",
          choices: department,
        },
      ])

      .then(function (answer) {
        connection.query("INSERT INTO roles SET ?", answer, function (err) {
          if (err) throw err;
          console.log(`${answer.title} role added`);

          cliPrompt();
        });
      });
  });
}

function editEmployees() {
  connection.query("SELECT * FROM employees",function(err,res){
    if(err) throw err;
    const updatedName =res.map(element => {
      return `${element.id}: ${element.first_name} ${element.last_name}`
    })
connection.query("SELECT title, id from roles", function(err,success){
  if (err) throw err;
  const role = success.map(element => element.title);
  inquirer.prompt([
    {
      name: "emp",
      type: "list",
      choices: updatedName,
      message:"Select employee to update"
    },
    {
      name: "role",
      type:"list",
      message:"What is the title of the new role",
      choices: role
    }
  ]).then(answers => {
    const updatedEmployee = answers.emp.split(":") [0];
    const updatedRole = success.find(element =>{
      return element.title === answers.role
    });
    connection.query("UPDATE employees SET role_id=? where id=?", [updatedRole.id,updatedEmployee], function(err,success){
      if (err) throw err;
      console.log("role has been changed");
      cliPrompt()
      })
    })
  })
})
}

 
          


function viewDepts() {
  var query = "SELECT * FROM departments";
  connection.query(query, function (err, res) {
    console.log(`Departments:`);
    res.forEach((departments) => {
      console.log(
        `ID: ${departments.id} | Title: ${departments.dept_name}`
      );
    });
    cliPrompt();
  });
}



  function exit() {
  connection.end();
}

cliPrompt();
