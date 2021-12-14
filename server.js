//dependencies
const mysql = require("mysql");
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
            "Add roles",
            "Add employees",
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
            } else if (answer.action == "View departments") {
                viewDepts();
            } else if (answer.action == "View roles") {
                viewRoles();
            } else if (answer.action == "Add employees") {
                addEmployees();
            } else if (answer.action == "Add departments") {
                addDepts();
            } else if (answer.action == "Add roles") {
                addRoles();
            } else if (answer.action == "Edit employees") {
                editEmployees();
            } else if (answer.action == "Remove employees") {
                deleteEmployees();
            } else if (answer.action == "Exit") {
                exit();
            }
        });
}

function addEmployees() {
  
    let query = "SELECT title FROM roles";

  
    let query2 =
        "SELECT employees.first_name, employees.last_name, roles.title, roles.salary, departments.dept_name, employees.manager_id " +
        "FROM employees " +
        "JOIN roles ON roles.id = employees.role_id " +
        "JOIN departments ON roles.department_id = departments.id " +
        "ORDER BY employees.id;";

    connection.query(query, function (err, res) {
        if (err) throw err;

        let rolesList = res;

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
                        roles = [];

                        for (i = 0; i < rolesList.length; i++) {
                            const roleId = i + 1;
                            roles.push(roleId + ": " + rolesList[i].title);
                        }

                        roles.unshift("0: Exit");

                        return roles;
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
                        return answers.select_roles !== "0: Exit";
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
                                    "SELECT employees.first_name, employees.last_name, roles.title, roles.salary, departments.dept_name, employees.manager_id " +
                                    "FROM employees " +
                                    "JOIN roles ON roles.id = employees.role_id " +
                                    "JOIN departments ON roles.department_id" +
                                    "ORDER BY employees.id";
                                connection.query(query, function (err, res) {
                                    if (err) throw err;

                                    if (answer.again == "Yes") {
                                        addEmployees();
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
};

function addDept() {
    let query = "SELECT departments.dept_name FROM departments";

    connection.query(query, function (err, res) {
        if (err) throw err;

        console.table(res);

        let addDeptPrompt = [
            {
                name: "new_department",
                type: "input",
                message: "Enter a new company department."

            },
        ];
        inquirer.prompt(addDeptPrompt)

            .then(function (answer) {
                console.log(answer);
                let query = "INSERT INTO departments SET ?";

                connection.query(query,
                    {

                        dept_name: answer.new_department
                    }, function (err, res) {

                        if (err) throw err;

                    });

                let addAgainP = [
                    {
                        name: "again",
                        type: "list",
                        message: "Would you like to add another department?",
                        choices: ["Yes", "Exit"]
                    },
                ];

                inquirer.prompt(addAgainP)

                    .then(function (answer) {

                        let query = "SELECT departments.dept_name FROM departments";

                        connection.query(query, function (err, res) {

                            if (err) throw err;

                            if (answer.again == "Yes") {

                                addDept();

                            } else if (answer.again == "Exit") {
                                console.table(res);

                                cliPrompt();

                            };

                        });

                    });

            });
    });
};
  
 
    function addRole() {
    let query1 = "SELECT roles.title AS roles, roles.salary, departments.dept_name FROM roles INNER JOIN departments ON departments.id = roles.department_id;";

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
                    message: "Enter a new company role."
                },
                {
                    name: "add_salary",
                    type: "input",
                    message: "Enter a salary for this role."
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
                        };
                        department.unshift("0: Exit");

                        return department;
                    }
                }
            ];

            inquirer.prompt(addRolePrompt)

                .then(function (answer) {

                    if (answer.select_department == "0: Exit") {
                        cliPrompt();
                    } else {
                        console.log(answer);

                        let query = "INSERT INTO roles SET ?";

                        connection.query(query,
                            {
                                title: answer.add_role,
                                salary: answer.add_salary,

                                department_id: parseInt(answer.select_department.split(":")[0])
                            }, function (err, res) {

                                if (err) throw err;

                            });
                        let addAgainP = [
                            {
                                name: "again",
                                type: "list",
                                message: "would you like to add another role?",
                                choices: ["Yes", "Exit"]
                            },
                        ];

                        inquirer.prompt(addAgainP)

                            .then(function (answer) {

                                let query = "SELECT roles.id, roles.title, AS roles, roles.salary, departments.dept_name FROM roles INNER JOIN departments ON departments.id = roles.department_id;";

                                connection.query(query, function (er, res) {

                                    if (err) throw err;

                                    if (answer.again == "Yes") {
                                        addRole();
                                    } else if (answer.again == "Exit") {
                                        console.table(res);

                                        cliPrompt();

                                    };

                                });
                            });
                    };
                });
        });

    });
};

function updateEmployee() {

    let query = "SELECT title FROM roles";

    let query2 =

    "SELECT employees.first_name, employees.last_name, roles.title, roles.salary, departments.dept_name, employees.manager.id " + "FROM employees " + "JOIN roles ON roles.id = employees.role_id " + "JOIN departments ON roles.department_id = departments.id" + "ORDER BY employees.id;"

    ;

    connection.query(query, function(err, res){

        if (err) throw err;

        let rolesList = res;

        connection.query(query2, function(err,res) {

            if (err) throw err;

            for(i =0; i < res.length; i++) {
                if(res[i].manager_id == 0) {

                    res[i].manager = "None"

                }else{

                    res[i].manager = res[res[i].manager_id -1].first_name + "" + res[res[i].manager_id -1].last_name;;
                };

                  delete res[i].manager_id;  
                };


            console.table(res);

let employeeList = res;

let addEmpPrompt = [
    {
        name: "select_employee",
        type: "list",
        message: "Select employee to edit",

        choices: function() {
            employees = [];

            for(i = 0; i < employeeList.length; i++) {
                const mId = i + 1;

                employees.push(mId + ": " + employeeList[i].first_name + " " + employeeList[i].last_name);

            };
            employees.unshift("0:Exit");

            return employees;
        }
    }
];
  
inquirer.prompt(addEmpPrompt)

.then(function(answer) {
    if(answer.select_employee == "0: Exit") {
        cliPrompt();
    }else{
 let empSelect = answer.select_employee.split(":")[0]

                    let empPropPrompt = [
                
                        {
                    
                            name: "select_role",
                            type: "list",
                            message: "Edit employee role.",
        
                            // dynamic choises using rolesList (title col of roles table)
                            choices: function() {
                                
                                // init roles array - used to return existing roles titles as choises array prompted to user
                                roles = [];
                                
                                // loop through rolesList to extract the role titles from rolesList which is an object array containing data from roles table in the form of rowPackets
                                for(i = 0; i < rolesList.length; i++) {
                                    
                                    // looping parameter "i" will allways align with the table index, therefore by adding 1 we have effectivly converted it to match table id's
                                    const roleId = i + 1;
        
                                    // concat roleId and title strings and push the resulting string into our roles (choises) array 
                                    roles.push(roleId + ": " + rolesList[i].title);
        
                                };

                                // add string "0: Exit" to the beginning of roles (choises)
                                roles.unshift("0: Exit");
                                
                                // return roles (choises) array to be rendered by inquirer to the user 
                                return roles;
                    
                            }
                            
                        },
        
                        {
                    
                            name: "select_manager",
                            type: "list",
                            message: "Edit employee manager",

                            // dynamic choises using managerList (first_name and last_name cols of employees table)
                            choices: function() {
                                
                                // init managers array - used to return existing employee names as choises array prompted to user
                                managers = [];
                    
                                // loop through managerList to extract the employee names from managerList which is an object array containing data from employees table in the form of rowPackets
                                for(i = 0; i < employeeList.length; i++) {
                                    
                                    // looping parameter "i" will allways align with the table index, therefore by adding 1 we have effectivly converted it to match table id's
                                    const mId = i + 1;

                                    // filter out emplyee from managers (choises) array that matches user selection of employee to edit
                                    if(answer.select_employee.split(": ")[1] !== employeeList[i].first_name + " " + employeeList[i].last_name) {
            
                                        // concat mId, first_name, and last_name strings and push the resulting string into our managers (choises) array
                                        managers.push(mId + ": " + employeeList[i].first_name + " " + employeeList[i].last_name);

                                    };
                                    
                                };
                                
                                // add string "0: None" to the beginning of managers (choises)
                                managers.unshift("0: None");

                                // add string "E: Exit" to the beginning of managers (choises)
                                managers.unshift("E: Exit");

                                // return managers (choises) array to be rendered by inquirer to the user 
                                return managers;
                    
                            },

                            // dont use this prompt if user selected Exit in previous prompt
                            when: function( answers ) {
                                
                                return answers.select_role !== "0: Exit";
                            
                            }
                            
                        }
                    
                    ];

                    // prompt user actions using inquirer 
                    inquirer.prompt(empPropPrompt)

                    // await user responce from inquirer
                    .then(function(answer) {

                        // if user selects "0: Exit" return to main menu
                        if(answer.select_role == "0: Exit" || answer.select_manager == "E: Exit") {

                            // prompt user for next action
                            cliPrompt();

                        }else{

                            console.log(answer);

                            // SQL command to insert new data in employees table
                            let query = "UPDATE employees SET ? WHERE employees.id = " + empSelect;
            
                            // connect to mySQL using query instruction to insert new employee in employee table
                            connection.query(query,
                            {
                                
                                // new emplyees table role_id col value is extracted by parsing roleId from the selected roles array string and converting it to int
                                role_id: parseInt(answer.select_role.split(":")[0]),
            
                                // new emplyees table manager_id col value is extracted by parsing mId from the selected managers array string and converting it to int
                                manager_id: parseInt(answer.select_manager.split(":")[0])
            
                            },
                            function(err, res){
            
                                // throw error if there is issue writing data
                                if (err) throw err;
                            
                            });
            
                            // array of actions to prompt user
                            let addAgainP = [
            
                                {
                            
                                    name: "again",
                                    type: "list",
                                    message: "Would you like to add another employee?",
                                    choices: ["Yes","Exit"]
                                
                                }
            
                            ];
            
                            // prompt user actions using inquirer 
                            inquirer.prompt(addAgainP)
            
                            // await user responce from inquirer
                            .then(function(answer) {
            
                                // SQL command to get employee first_name/ last_name/ manager id, role title/ salary and department name data from employees, roles, and department tables
                                let query =

                                    "SELECT employees.first_name, employees.last_name, roles.title, roles.salary, department.dept_name, employees.manager_id " +
                                    "FROM employees " +
                                    "JOIN roles ON roles.id = employees.role_id " +
                                    "JOIN department ON roles.department_id = department.id " +
                                    "ORDER BY employees.id;"

                                ;

                                // connect to mySQL using query instruction to access first_name, last_name from employees table
                                connection.query(query, function(err,res) {
                        
                                    // throw error if there is issue accessing data
                                    if (err) throw err;
            
                                    // execute function updateEmployee again if user selection is "Yes"
                                    if(answer.again == "Yes") {
            
                                        // prompt add new employee to employee_db
                                        updateEmployee();
                                    
                                    // update employee first/ last_name table in terminal, and execute function cliPrompt if user selection is "Exit"
                                    }else if(answer.again == "Exit") {
                                        
                                        // add manager names to the manager_id col to be displayed in terminal
                                        for(i = 0; i < res.length; i++) {

                                            // if manager_Id contains a "0" then lable it as "None"
                                            if(res[i].manager_id == 0) {
                                                
                                                res[i].manager = "None" 
                                            
                                            }else{

                                                // create new row called manager, containing each employee's manager name
                                                res[i].manager = res[res[i].manager_id - 1].first_name + " " + res[res[i].manager_id - 1].last_name;

                                            };

                                            // remove manager id from res so as to not display it
                                            delete res[i].manager_id;

                                        };

                                        // print data retrieved to terminal in table format 
                                        console.table(res);
            
                                        // prompt user for next action
                                        cliPrompt(); 
            
                                    };  
            
                                });
            
                            }); 
                            
                        };

                    });    

                };

            });

        })

    })
    
};

// delete existing employee in employee_db
function deleteEmployee() {

    // SQL command to get data from roles table
    let query = "SELECT employees.id, employees.first_name, employees.last_name FROM employees;";

    // connect to mySQL using query instruction 1 to access data from roles table
    connection.query(query, function(err, res){

        // throw error if there is issue accessing data
        if (err) throw err;

        // combine names from first_name/ last_name cols to be displayed in terminal
        for(i = 0; i < res.length; i++) {

            // create new row called manager, containing each employee's manager name
            res[i].employee = res[i].first_name + " " + res[i].last_name;
            // empDisplay = res[i].first_name + " " + res[i].last_name;

            // remove first_name from res so as to not display it
            delete res[i].first_name;

            // remove last_name from res so as to not display it
            delete res[i].last_name;

        };

        // print data retrieved to terminal in table format 
        console.table(res);

        // assign data from employees table (res) to employeeList
        let employeeList = res;

        // array of actions to prompt user
        let addEmpPrompt = [

            {
        
                name: "select_employee",
                type: "list",
                message: "Terminate employee",
                
                // dynamic choises using employeeList (first_name and last_name cols of employees table)
                choices: function() {
                    
                    // init employees array - used to return existing employee names as choises array prompted to user
                    employees = [];
        
                    // loop through employeeList to extract the employee names from employeeList which is an object array containing data from employees table in the form of rowPackets
                    for(i = 0; i < employeeList.length; i++) {

                        // concat mId, first_name, and last_name strings and push the resulting string into our employees (choises) array
                        employees.push(employeeList[i].id + ": " + employeeList[i].employee);
                        
                    };
                    
                    // add string "0: None" to the beginning of employees (choises)
                    employees.unshift("0: Exit");

                    // return employees (choises) array to be rendered by inquirer to the user 
                    return employees;
        
                }
                
            },

            {
                
                name: "confirm",
                type: "list",

                // dynamic message using user selected employee name
                message: function(answers) {
                        
                    return "Are you sure you want to TERMINATE " + answers.select_employee.split(": ")[1];
                
                },
                
                // prompt user to pick between Yes and No
                choices: ["Yes","No"],

                // dont use this prompt if user selected Exit in previous prompt
                when: function( answers ) {
                    
                    return answers.select_employee !== "0: Exit";
                
                }
                
            }

        ];

        // prompt user actions using inquirer 
        inquirer.prompt(addEmpPrompt)

        // await user responce from inquirer
        .then(function(answer) {

            // if user selects "0: Exit" return to main menu
            if(answer.select_employee == "0: Exit") {

                // prompt user for next action
                cliPrompt();
            
            // if user selects "No" restart deleteEmployee
            }else if(answer.confirm == "No") {

                // prompt user for next action
                deleteEmployee();

            }else{

                // SQL command to insert new data in employees table
                let query = "DELETE FROM employees WHERE employees.id =" + answer.select_employee.split(": ")[0];

                // connect to mySQL using query instruction to insert new employee in employee table
                connection.query(query, function(err, res) {

                   
                    if (err) throw err;
                
                });

                
                let addAgainP = [

                    {
                
                        name: "again",
                        type: "list",
                        message: "Would you like to remove another employee?",
                        choices: ["Yes","Exit"]
                    
                    }

                ];

                // prompt user actions using inquirer 
                inquirer.prompt(addAgainP)

                // await user responce from inquirer
                .then(function(answer) {

                    // SQL command to get data from employees table
                    let query = "SELECT employees.id, employees.first_name, employees.last_name FROM employees;";

                    // connect to mySQL using query instruction to access data from roles table
                    connection.query(query, function(err, res){

                        // throw error if there is issue accessing data
                        if (err) throw err;

                        // combine names from first_name/ last_name cols to be displayed in terminal
                        for(i = 0; i < res.length; i++) {

                            // create new row called manager, containing each employee's manager name
                            res[i].employee = res[i].first_name + " " + res[i].last_name;

                            // remove first_name from res so as to not display it
                            delete res[i].first_name;

                            // remove last_name from res so as to not display it
                            delete res[i].last_name;

                        };

                        // execute function updateEmployee again if user selection is "Yes"
                        if(answer.again == "Yes") {

                            // prompt add new employee to employee_db
                            deleteEmployee();
                        
                        // update employee first/ last_name table in terminal, and execute function cliPrompt if user selection is "Exit"
                        }else if(answer.again == "Exit") {
                            
                            
                            // print data retrieved to terminal in table format 
                            console.table(res);

                            // prompt user for next action
                            cliPrompt(); 

                        };

                    });

                });

            };

        });

    });
    
};

// exit employee-traker 
function exit() {

    // terminate mySQL connection
    connection.end();

};

 cliPrompt();