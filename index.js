const consoleTable = require(`console.table`);
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
      let sql = `SELECT id as department_id, department_name FROM department`;

      db.query(sql, (error,departments) => {
          console.table(departments);
          promptMenu();
      })
  }

  function viewRoles() {
      let sql = `SELECT role_id as id, title, salary, department_id FROM role INNER JOIN department on role.department_id = department.id`;

      db.query(sql, (error,roles) => {
          console.table(roles);
          promptMenu();
      })
  }

  function viewEmployees() {
      let sql = `SELECT employee.employee_id as id, employee.first_name, employee.last_name, role.title, role.salary, department.department_name as department, employee.manager_id as manager_id FROM employee INNER JOIN role on employee.role_id = role.role_id INNER JOIN department on role.department_id = department.id ORDER BY (employee.employee_id) ASC`;

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
          db.query(`INSERT INTO department(department_name) VALUES (?)`, response.department, (error,department) => {
            error ? console.log(error) : true;
            promptMenu();
          })
      })
  }

  function addRole() {
      let sql = `SELECT role.title AS role, role.salary, department.department_name FROM role INNER JOIN department ON department.id = role.department_id;`
      let sqlAlt = `SELECT department.department_name FROM department`;

      db.query(sql, (error, selections) => {
        error ? console.log(error) : true;
        db.query(sqlAlt, (error,role) => {
            error ? console.log(error) : true;
            let departmentsList = role;
            function getDepartmentList(departmentsList) {
                let deps = [];
                departmentsList.forEach(item => deps.push(item.department_name));
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
                let rolesQuery = `INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?);`;

                function generateNewRole(department) {
                    let params = [response.role, parseInt(response.salary), department];

                    db.query(rolesQuery, params, (error, newRole) => {
                        error ? console.log(error) : true;
                        promptMenu();
                    })
                }

                db.query(`SELECT department.id FROM department WHERE department_name = ?`),
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
      let managersQuery = `SELECT employee.first_name, employee.last_name, role.title, role.salary, department.department_name, employee.manager_id FROM employee JOIN role ON role.role_id = employee.role_id JOIN department ON role.department_id = department.id WHERE employee.manager_id = 0 ORDER BY employee.employee_id;`;

      db.query(rolesQuery, (error, roles) => {
        error ? console.log(error) : true;
        let roles = roles;

        db.query(managersQuery, (error,managers) => {
            error ? console.log(error) : true;

            function getManagerList() {
                let managerList = [];
                managers.forEach(manager => managerList.push(manager.first_name + ` ` + manager.last_name));
                managerList.push(`No Manager(s)`);
                return managerList;
            }

            roles.forEach(role => {
                role.manager_id == 0 ? role.manager = `None` : role.manager = role[role.manager_id - 1].first_name + ` ` + role[role.manager_id - 1].last_name;
                delete role.manager_id;
            })

            console.table(managers);

            const employeePrompt = [
                {

                }
            ]
        })
        
      })
  }

promptMenu();