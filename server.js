//dependencies
const mysql = require("mysql2");
const inquirer = require("inquirer");

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
      "Remove employees",
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
      } else if (answer.action == "Remove employees") {
        deleteEmployees();
      } else if (answer.action == "View roles") {
       viewRoles();}

      } else if (answer.action == "Exit") {
        exit();
      }
    });
  }


function viewAll() {
  var query = "SELECT * FROM employees";
  connection.query(query, function (err, res) {
    console.log(`all employees:`);
    res.forEach (employees => {
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
    res.forEach (roles => {
      console.log(
        `ID: ${roles.id} | Title: ${roles.title}  | Salary${roles.salary} | department_ID: ${roles.department-ID}`
      );
    });
    cliPrompt();
  });
}

function addEmployee() {
  let query = "SELECT title FROM departments";

  let query2 =
    "SELECT employees.first_name, employees.last_name, departments.title, departments.salary, departments.dept_name, employees.manager_id " +
    "FROM employees " +
    "JOIN departments ON departments.id = employees.role_id " +
    "JOIN departments ON departments.department_id = departments.id " +
    "ORDER BY employees.id;";

  connection.query(query, function (err, res) {
    if (err) throw err;

    let departmentsList = res;

    connection.query(query2, function (err, res) {
      if (err) throw err;

      for (i = 0; i < res.length; i++) {
        if (res[i].manager_id == 0) {
          res[i].manager = "None";
        } else {
          res[i].manager =
            res[res[i].manager_id - 1].first_name +
            "" +
            res[res[i].manager_id - 1].last_name;
        }
        delete res[i].manager_id;
      }

      console.table(res);

      let managerList = res;

      let addEmpPromt = [
        {
          name: "first_name",
          type: "input",
          message: "Enter new employee's first name.",
        },
        {
          name: "last_name",
          type: "input",
          message: "Enter new employee's last name.",
        },
        {
          name: "select_role",
          type: "list",
          message: "Select new employee's role.",

          choices: function () {
            departments = [];

            for (i = 0; i < departmentsList.length; i++) {
              const roleId = i + 1;
              departments.push(roleId + ": " + departmentsList[i].title);
            }

            departments.unshift("0: Exit");

            return departments;
          },
        },
        {
          name: "select_manager",
          type: "list",
          message: "Select new employee's manager",

          choices: function () {
            managers = [];

            for (i = 0; i < managerList.length; i++) {
              const mId = i + 1;

              managers.push(
                mId +
                  ":" +
                  managerList[i].first_name +
                  "" +
                  managerList[i].last_name
              );
            }
            managers.unshift("0: None");

            managers.unshift("E: Exit");

            return managers;
          },

          when: function (answers) {
            return answers.select_departments !== "0: Exit";
          },
        },
      ];

      inquirer
        .prompt(addEmpPromt)

        .then(function (answer) {
          if (
            answer.select_role == "0: Exit" ||
            answer.select_manager == "E: Exit"
          ) {
            cliPrompt();
          } else {
            console.log(answer);

            let query = "INSERT INTO employees SET ?";

            connection.query(
              query,
              {
                first_name: answer.first_name,
                last_name: answer.last_name,

                role_id: parseInt(asnwer.select_role.split(":")[0]),
                manager_id: parseInt(answer.select_manager.split(":")[0]),
              },
              function (err, res) {
                if (err) throw err;
              }
            );

            let addAgainP = [
              {
                name: "again",
                type: "list",
                message: "Would you like to add another employee?",
                choices: ["yes", "Exit"],
              },
            ];

            inquirer
              .prompt(addAgainP)

              .then(function (answer) {
                let query =
                  "SELECT employees.first_name, employees.last_name, departments.title, departments.salary, departments.dept_name, employees.manager_id " +
                  "FROM employees " +
                  "JOIN departments ON departments.id = employees.role_id " +
                  "JOIN departments ON departments.department_id" +
                  "ORDER BY employees.id";
                connection.query(query, function (err, res) {
                  if (err) throw err;

                  if (answer.again == "Yes") {
                    addEmployee();
                  } else if (answer.again == "Exit") {
                    for (i = 0; i < res.length; i++) {
                      if (res[i].manager_id == 0) {
                        res[i].manager = "None";
                      } else {
                        res[i].manager =
                          res[res[i].manager_id - 1].first_name +
                          "" +
                          res[res[i].manager_id - 1].last_name;
                      }

                      delete res[i].manager_id;
                    }
                    console.table(res);

                    cliPrompt();
                  }
                });
              });
          }
        });
    });
  });
}

function addDept() {
  let query = "SELECT departments.dept_name FROM departments";

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
  let query1 =
    "SELECT departments.title AS departments, departments.salary, departments.dept_name FROM departments INNER JOIN departments ON departments.id = departments.department_id;";

  let query2 = "SELECT departments.dept_name FROM department";

  connection.query(query1, function (err, res) {
    if (err) throw err;
    console.table(res);

    connection.query(query2, function (err, res) {
      if (err) throw err;
      let departmentList = res;

      let addRolePrompt = [
        {
          name: "add_role",
          type: "input",
          message: "Enter a new company role.",
        },
        {
          name: "add_salary",
          type: "input",
          message: "Enter a salary for this role.",
        },
        {
          name: "select_department",
          type: "list",
          message: "Select a department",

          choices: function () {
            department = [];

            for (i = 0; i < departmentList.length; i++) {
              const roleId = i + 1;

              department.push(roleId + ":" + departmentList[i].dept_name);
            }
            department.unshift("0: Exit");

            return department;
          },
        },
      ];

      inquirer
        .prompt(addRolePrompt)

        .then(function (answer) {
          if (answer.select_department == "0: Exit") {
            cliPrompt();
          } else {
            console.log(answer);

            let query = "INSERT INTO departments SET ?";

            connection.query(
              query,
              {
                title: answer.add_role,
                salary: answer.add_salary,

                department_id: parseInt(answer.select_department.split(":")[0]),
              },
              function (err, res) {
                if (err) throw err;
              }
            );
            let addAgainP = [
              {
                name: "again",
                type: "list",
                message: "would you like to add another role?",
                choices: ["Yes", "Exit"],
              },
            ];

            inquirer
              .prompt(addAgainP)

              .then(function (answer) {
                let query =
                  "SELECT departments.id, departments.title, AS departments, departments.salary, departments.dept_name FROM departments INNER JOIN departments ON departments.id = departments.department_id;";

                connection.query(query, function (er, res) {
                  if (err) throw err;

                  if (answer.again == "Yes") {
                    addRole();
                  } else if (answer.again == "Exit") {
                    console.table(res);

                    cliPrompt();
                  }
                });
              });
          }
        });
    });
  });
}

function editEmployees() {
  let query = "SELECT title FROM departments";

  let query2 =
    "SELECT employees.first_name, employees.last_name, departments.title, departments.salary, departments.dept_name, employees.manager.id " +
    "FROM employees " +
    "JOIN departments ON departments.id = employees.role_id " +
    "JOIN departments ON departments.department_id = departments.id" +
    "ORDER BY employees.id;";

  connection.query(query, function (err, res) {
    if (err) throw err;

    let departmentsList = res;

    connection.query(query2, function (err, res) {
      if (err) throw err;

      for (i = 0; i < res.length; i++) {
        if (res[i].manager_id == 0) {
          res[i].manager = "None";
        } else {
          res[i].manager =
            res[res[i].manager_id - 1].first_name +
            " " +
            res[res[i].manager_id - 1].last_name;
        }

        delete res[i].manager_id;
      }

      console.table(res);

      let employeeList = res;

      let addEmpPrompt = [
        {
          name: "select_employee",
          type: "list",
          message: "Select employee to edit",

          choices: function () {
            employees = [];

            for (i = 0; i < employeeList.length; i++) {
              const mId = i + 1;

              employees.push(
                mId +
                  ": " +
                  employeeList[i].first_name +
                  " " +
                  employeeList[i].last_name
              );
            }
            employees.unshift("0:Exit");

            return employees;
          },
        },
      ];

      inquirer
        .prompt(addEmpPrompt)

        .then(function (answer) {
          if (answer.select_employee == "0: Exit") {
            cliPrompt();
          } else {
            let empSelect = answer.select_employee.split(":")[0];

            let empPropPrompt = [
              {
                name: "select_role",
                type: "list",
                message: "Edit employee role.",

                choices: function () {
                  departments = [];

                  for (i = 0; i < departmentsList.length; i++) {
                    const roleId = i + 1;

                    departments.push(roleId + ": " + departmentsList[i].title);
                  }

                  departments.unshift("0: Exit");
                  return departments;
                },
              },

              {
                name: "select_manager",
                type: "list",
                message: "Edit employee manager",

                choices: function () {
                  managers = [];

                  for (i = 0; i < employeeList.length; i++) {
                    const mId = i + 1;

                    if (
                      answer.select_employee.split(": ")[1] !==
                      employeeList[i].first_name +
                        " " +
                        employeeList[i].last_name
                    ) {
                      managers.push(
                        mId +
                          ": " +
                          employeeList[i].first_name +
                          " " +
                          employeeList[i].last_name
                      );
                    }
                  }

                  managers.unshift("0: None");

                  managers.unshift("E: Exit");

                  return managers;
                },

                when: function (answers) {
                  return answers.select_role !== "0: Exit";
                },
              },
            ];

            inquirer.prompt(empPropPrompt).then(function (answer) {
              if (
                answer.select_role == "0: Exit" ||
                answer.select_manager == "E: Exit"
              ) {
                cliPrompt();
              } else {
                console.log(answer);

                let query =
                  "UPDATE employees SET ? WHERE employees.id = " + empSelect;

                connection.query(
                  query,
                  {
                    role_id: parseInt(answer.select_role.split(":")[0]),
                    manager_id: parseInt(answer.select_manager.split(":")[0]),
                  },
                  function (err, res) {
                    if (err) throw err;
                  }
                );

                let addAgainP = [
                  {
                    name: "again",
                    type: "list",
                    message: "Would you like to add another employee?",
                    choices: ["Yes", "Exit"],
                  },
                ];

                inquirer
                  .prompt(addAgainP)

                  .then(function (answer) {
                    let query =
                      "SELECT employees.first_name, employees.last_name, departments.title, departments.salary, department.dept_name, employees.manager_id " +
                      "FROM employees " +
                      "JOIN departments ON departments.id = employees.role_id " +
                      "JOIN department ON departments.department_id = department.id " +
                      "ORDER BY employees.id;";

                    connection.query(query, function (err, res) {
                      if (err) throw err;

                      if (answer.again == "Yes") {
                        updateEmployee();
                      } else if (answer.again == "Exit") {
                        for (i = 0; i < res.length; i++) {
                          if (res[i].manager_id == 0) {
                            res[i].manager = "None";
                          } else {
                            res[i].manager =
                              res[res[i].manager_id - 1].first_name +
                              " " +
                              res[res[i].manager_id - 1].last_name;
                          }

                          delete res[i].manager_id;
                        }

                        console.table(res);

                        cliPrompt();
                      }
                    });
                  });
              }
            });
          }
        });
    });
  });
}

function viewDepts() {
    var query = "SELECT * FROM departments";
    connection.query(query, function(err, res) {
        console.log(`departments:`)
        res.forEach(departments => {
            console.log(`ID: ${departments.id} | Title: ${departments.title} | Salary: ${departments.salary} | Department ID: ${departments.department_id}`);
        })
        cliPrompt();
    });
};

function viewDepts() {
    var query = "SELECT * FROM departments";
    connection.query(query, function(err, res) {
        console.log(`Departments:`)
        res.forEach(departments => {
            console.log(`ID: ${departments.id} | Title: ${departments.title} | Salary: ${departments.salary} | Department ID: ${departments.department_id}`);
        })
        cliPrompt();
    });
};





function deleteEmployee() {
  
  let query =
    "SELECT employees.id, employees.first_name, employees.last_name FROM employees;";

  connection.query(query, function (err, res) {
    if (err) throw err;

    for (i = 0; i < res.length; i++) {
      res[i].employee = res[i].first_name + " " + res[i].last_name;

      delete res[i].first_name;

      delete res[i].last_name;
    }

    console.table(res);

    let employeeList = res;

    let addEmpPrompt = [
      {
        name: "select_employee",
        type: "list",
        message: "Terminate employee",

        choices: function () {
          employees = [];

          for (i = 0; i < employeeList.length; i++) {
            employees.push(
              employeeList[i].id + ": " + employeeList[i].employee
            );
          }

          employees.unshift("0: Exit");

          return employees;
        },
      },

      {
        name: "confirm",
        type: "list",

        message: function (answers) {
          return (
            "Are you sure you want to TERMINATE " +
            answers.select_employee.split(": ")[1]
          );
        },

        choices: ["Yes", "No"],

        when: function (answers) {
          return answers.select_employee !== "0: Exit";
        },
      },
    ];

    inquirer
      .prompt(addEmpPrompt)

      .then(function (answer) {
        if (answer.select_employee == "0: Exit") {
          cliPrompt();
        } else if (answer.confirm == "No") {
          deleteEmployee();
        } else {
          let query =
            "DELETE FROM employees WHERE employees.id =" +
            answer.select_employee.split(": ")[0];

          connection.query(query, function (err, res) {
            if (err) throw err;
          });

          let addAgainP = [
            {
              name: "again",
              type: "list",
              message: "Would you like to remove another employee?",
              choices: ["Yes", "Exit"],
            },
          ];

          inquirer
            .prompt(addAgainP)

            .then(function (answer) {
              let query =
                "SELECT employees.id, employees.first_name, employees.last_name FROM employees;";

              connection.query(query, function (err, res) {
                if (err) throw err;

                for (i = 0; i < res.length; i++) {
                  res[i].employee = res[i].first_name + " " + res[i].last_name;

                  delete res[i].first_name;

                  delete res[i].last_name;
                }

                if (answer.again == "Yes") {
                  deleteEmployee();
                } else if (answer.again == "Exit") {
                  console.table(res);

                  cliPrompt();
                }
              });
            });
        }
      });
  });
}

function exit() {
  connection.end();
}

cliPrompt();
