// const consoleTable = require(`console.table`);
const inquirer = require(`inquirer`);
const mysql = require(`mysql2`);
require(`dotenv`).config();

const db = mysql.createConnection(

    {
      host: `localhost`,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    },
    
    console.log(`Connected to the ${process.env.DB_NAME} database.`)

  );

  const menu = [
      {
      name: `choice`,
      type: `list`,
      message: `What would you like to do?`,
      choices: [
        `View all departments`,
        `View all roles`,
        `View all employees`,
        `Add a department`,
        `Add a role`,
        `Add an employee`,
        `Update an employee role`,
      ]
    }
  ];

  function promptMenu() {
      console.log(`Main Menu - Select an option.`)
      inquirer.prompt(menu).then(response => {
          switch(response.choice) {
            case `View all departments`:
                viewDepartments();
                break;
            case `View all roles`:
                viewRoles();
                break;
            case `View all employees`:
                viewEmployees();
                break;
            case `Add a department`:
                addDepartment();
                break;
            case `Add a role`:
                addRole();
                break;
            case `Add an employee`:
                addEmployee();
                break;
            case `Update an employee role`:
                updateEmployeeRole();
                break;
          }
      })
  }

  function viewDepartments() {
      let sql = `SELECT id as departmentID, departmentName FROM department`;

      db.query(sql, (error,departments) => {
          console.table(departments);
          promptMenu();
      })
  }

  function viewRoles() {
      let sql = `SELECT roleID as id, title, salary, departmentID FROM role INNER JOIN department on role.departmentID = department.id`;

      db.query(sql, (error,roles) => {
          console.table(roles);
          promptMenu();
      })
  }

  function viewEmployees() {
      let sql = `SELECT employee.employeeID as id, employee.firstName, employee.lastName, role.title, role.salary, department.departmentName as department, employee.managerID as managerID FROM employee INNER JOIN role on employee.roleID = role.roleID INNER JOIN department on role.departmentID = department.id ORDER BY (employee.employeeID) ASC`;

      db.query(sql, (error,employees) => {
          error ? console.log(error) : true;
          console.table(employees);
          promptMenu();
      })
  }

  function addDepartment() {
      inquirer.prompt({
          name: `department`,
          type: `input`,
          message: `What department would you liek to add to the database?`
      }).then(response => {
          db.query(`INSERT INTO department(departmentName) VALUES (?)`, response.department, (error,department) => {
            error ? console.log(error) : true;
            promptMenu();
          })
      })
  }

  function addRole() {
      let sql = `SELECT role.title AS role, role.salary, department.departmentName FROM role INNER JOIN department ON department.id = role.departmentID;`
      let sqlAlt = `SELECT department.departmentName FROM department`;

      db.query(sql, (error, selections) => {
        error ? console.log(error) : true;
        db.query(sqlAlt, (error,role) => {
            error ? console.log(error) : true;
            let departmentsList = role;
            function getDepartmentList(departmentsList) {
                let deps = [];
                departmentsList.forEach(item => deps.push(item.departmentName));
                return deps;
            }

            let addRolePrompt = [
                {
                    name: `role`,
                    type: `input`,
                    message: `What role would you like to add?`
                },
                {
                    name: `salary`,
                    type: `input`,
                    message: `What is the salary for the role?`
                },
                {
                    name: `department`,
                    type: `list`,
                    message: `What department does this role belong to?`,
                    choices: getDepartmentList(departmentsList)
                }
            ]

            inquirer.prompt(addRolePrompt).then(response => {
                let rolesQuery = `INSERT INTO role (title, salary, departmentID) VALUES (?, ?, ?);`;

                function generateNewRole(department) {
                    let params = [response.role, parseInt(response.salary), department];

                    db.query(rolesQuery, params, (error, newRole) => {
                        error ? console.log(error) : true;
                        promptMenu();
                    })
                }

                db.query(`SELECT department.id FROM department WHERE departmentName = ?`),
                response.department,
                (error,dept) => {
                    const department = dept[0].id;
                    generateNewRole(department);
                }
            })
        })
      })
  }

  function addEmployee() {
      let rolesQuery = `SELECT title FROM role`;
      let managersQuery = `SELECT employee.firstName, employee.lastName, role.title, role.salary, department.departmentName, employee.managerID FROM employee JOIN role ON role.roleID = employee.roleID JOIN department ON role.departmentID = department.id WHERE employee.managerID = 0 ORDER BY employee.employeeID;`;

      db.query(rolesQuery, (error, result) => {
        error ? console.log(error) : true;
        let roles = result;

        db.query(managersQuery, (error,result) => {
            error ? console.log(error) : true;
            let managers = result;

            function getManagerList() {
                let managerList = [];
                managers.forEach(manager => managerList.push(manager.firstName + ` ` + manager.lastName));
                managerList.push(`No Manager(s)`);
                return managerList;
            }

            roles.forEach(role => {
                role.managerID == 0 ? role.manager = `None` : role.manager = role[role.managerID - 1].firstName + ` ` + role[role.managerID - 1].lastName;
                delete role.managerID;
            })

            console.table(managers);

            const employeePrompt = [
                {
                    type: `input`,
                    name: `firstName`,
                    message: `What is the first name of this new employee?`,
				},
				{
					type: `input`,
					name: `lastName`,
					message: `What is the last name of this new employee?`,
				},
				{
					type: `list`,
					name: `role`,
					message: `What is the role of this new employee?`,
					choices: getRoles(),
				},
				{
					type: `list`,
					name: `manager`,
					message: `Who is the manager of this new employee?`,
					choices: getManagerList(),
				},
            ]

            inquirer.prompt(employeePrompt).then(response => {
                console.table(response);

                genQueryVars = (managerID) => {
                    db.query(`SELECT roleID FROM role WHERE role.title = ?`), response.role, (error, result) => {
                        error ? console.log(error) : console.log(`Processing...`);

                        const roleID = result[0].roleID;

                        let queryVars = [response.firstName, response.lastName, roleID, managerID];

                        const insertSQL = `INSERT INTO employee(firstName, lastName, roleID, managerID) VALUES (?, ?, ?, ?)`;
                        db.query(insertSQL, queryVars, (error, result) => {
                            error ? console.log(error) : true;
                            console.log(`Entered ${queryVars[0]} ${queryVars[1]} into your database.`);
                            promptMenu();
                        })
                    }
                }

                getManagerID = (managerFirstName,managerLastName) => {
                    const managerIDQuery = `SELECT employeeID FROM employee WHERE employee.firstName = ? and employee.lastName = ?`;

                    db.query(managerIDQuery, [managerFirstName, managerLastName], (error, result) => {
                        error ? console.log(error) : true;

                        const managerID = result[0].employeeID;

                        genQueryVars(managerID);
                    })
                }

                startApp = () => {
                    if (response.manager != `No Manager(s)`) {
                        const manager = response.manager.split(``);
                        const managerFirstName = manager[0];
                        const managerLastName = manager[1];
                        getManagerID(managerFirstName, managerLastName);
                    } else {
                        let managerID = 0;
                        genQueryVars(managerID);
                    }
                }
                startApp();
            })

            function getRoles() {
                return function() {
                    let roleList = [];

                    roles.forEach(role => {
                        roleList.push(role.title);
                    })
                    return roleList;
                }
            }
        })
        
      })
  }

function updateEmployee() {
    const rolesQuery = `SELECT title FROM role`;
    const employeeQuery = 
    `SELECT employee.firstName, employee.lastName, role.title, role.salary, department.departmentName, employee.managerID ` +
    `FROM employee ` +
    `JOIN role ON role.roleID = employee.roleID ` +
    `JOIN department ON role.departmentID = department.id ` +
    `ORDER BY employee.employeeID;`

    let sqlVars = [];
    db.query(rolesQuery, (error, result) => {
        error ? console.log(error) : true;
        let roles = result;
        function getRoles() {
            let roleList = [];

            roles.forEach(role => {
                roleList.push(role.title);
            })
            return roleList;
        }

        db.query(employeeQuery, (error, result) => {
            error ? console.log(error) : true;
            let employees = result;
            let updateEmployeeInfo = [
                {
                    name: `employee`,
                    type: `list`,
                    message: `Which employee would you like to update the role of?`,
                    choices: function() {
                        let emp = [];
                        employees.forEach((employee,index) => {
                            const managerId = index + 1;
                            emp.push(employee.firstName + ` ` + employee.lastName);
                        })
                        return emp;
                    }
                }
            ]

            let updateEmployeeRole = [
                {
                    name: `newRole`,
                    type: `list`,
                    message: `What role would you like to assign to this employee?`,
                    choices: getRoles(),
                }
            ]
            inquirer.prompt(updateEmployeeInfo).then(employeeToUpdate => {
                let selectedEmployee = employeeToUpdate.employee.split(` `)[0];
                queryVars.push(selectedEmployee);

                inquirer.prompt(updateEmployeeRole).then(role => {
                    let updatedRole = role.newRole;
                    queryVars.push(updatedRole);
                    let roleId;
                    db.query(`SELECT role_id FROM role WHERE title = ?`, queryVars[1], (error, result) => {
                        error ? console.log(error) : true;
                        roleId = result[0].roleID;
                        console.log(`${queryVars[0]}'s role has been updated to ${queryVars[1]}'`);
                        queryVars.pop();
                        queryVars.push(roleId);
                        queryVars.reverse();
                        let updateQuery = `UPDATE employee SET role_id = ? WHERE first_name = ?`;
                        db.query(updateQuery, queryVars, (error,result) => {
                            error ? console.log(error) : true;
                        })
                        promptMenu();
                    })
                })
            })
        })
    })
}

promptMenu();