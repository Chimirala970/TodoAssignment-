const express = require("express");
const {open} = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path"); 
const format = require("date-fns/format");

const isMatch = require("date-fns/isMatch"); 

var isValid = require("date-fns/isValid"); 

const app = express();
app.use(express.json()); 

let db; 

const initializeDbAndServer = async() =>{
    try{
        db = await open({
            filename : path.join(__dirname,"todoApplication.db");
            driver : sqlite3.Database, 
        });
        app.listen(3000,()=>{
            console.log("Server Running at http://localhost:3000/"); 
        });
    }
    catch(e){
        console.log(`DataBase Error is ${e.message}`);
        process.exit(1); 
    }
};
initializeDbAndServer(); 

const hasPriorityAndStatusProperties=(requestQuery)=>{
    return(
        requestQuery.priority != undefined && requestQuery.status != undefined
    );
};

const hasPriorityProperty = (requestQuery) =>{
    return requestQuery.priority != undefined; 
};

const hasStatusProperty = (requestQuery) =>{
    return requestQuery.status != undefined; 
};

const hasCategoryAndStatus = (requestQuery) =>{
    return(
        requestQuery.category != undefined && requestQuery.status != undefined
    );
};

const hasCategoryAndPriority = (requestQuery) =>{
    return(
        requestQuery.category != undefined && requestQuery.priority != undefined
    );
};

const hasSearchProperty = (requestQuery) =>{
    return requestQuery.search_q != undefined; 
};

const hasCategoryProperty = (requestQuery) =>{
    return requestQuery.category != undefined; 
};

const outputResult = (dbObject) =>{
    return{
        id : dbObject.id,
        todo : dbObject.todo,
        priority : dbObject.priority,
        category : dbObject.category,
        status : dbObject.status,
        dueDate : dbObject.due_date, 
    };
};


app.get("/todos/", async(request,response) =>{
    let data = null; 

    let getTodosQuery = "";
    const {search_q = "",priority,status,category} = request.query; 

    switch(true){
        case hasPriorityAndStatusProperties(request.query):
           if(priority == "HIGH" || priority == "MEDIUM" || priority == "LOW"){
               if(status == "TODO" || status == "IN PROGRESS" || status == "DONE"){
                   getTodosQuery = `SELECT * FROM todo WHERE status = '${status}' AND priority = '${priority}';`;
                   data = await db.all(getTodosQuery);
                   response.send(data.map((eachItem) => outputResult(eachItem)));
               }
               else{
                   response.status(400);
                   response.send("Invalid Todo Status");
               }
           }else{
               response.status(400);
               response.send("Invalid Todo Priority");
           }
        break; 

        case hasCategoryAndStatus(request.query):
            if(
                category == "WORK" ||
                category == "HOME" ||
                category == "LEARNING"
            ){
                if(
                    status == "TODO" ||
                    status == "INPROGRESS" ||
                    status == "DONE"
                ){
                    getTodosQuery = `SELECT * FROM todo WHERE category = '${category}' and
                    status = '${status}';`;
                    data = await db.all(getTodosQuery);
                    response.send(data.map((eachItem) => outputResult(eachItem)));
                }
                else{
                    response.status(400);
                    response.send("Invalid Todo Status"); 
                }
            }else{
                    response.status(400);
                    response.send("Invalid Todo Category")
            }
        break; 

        case hasCategoryAndPriority(request.query):
            if(
                category == "WORK" ||
                category == "HOME" ||
                category == "LEARNING"
            ){
                if(
                    priority == "HIGH" ||
                     priority == "MEDIUM" ||
                      priority == "LOW"
                ){
                    getTodosQuery = `SELECT * FROM todo WHERE category = '${category}' and priority = '${priority}'; `;
                    data = await db.all(getTodosQuery);
                    response.send(data.map((eachItem) => outputResult(eachItem))); 
                }else{
                    response.status(400);
                    response.send("Invalid Todo Priority"); 
                }
            }else{
                response.status(400);
                response.send("Invalid Todo Category"); 
            }

            break; 
            case hasPriorityProperty(request.query):
                if(priority == "HIGH" || priority == "MEDIUM" || priority == "LOW"){
                    getTodosQuery = `SELECT * FROM todo WHERE priority = '${priority}';`;
                    data = await db.all(getTodosQuery);
                    response.send(data.map((eachItem) => outputResult(eachItem)));
                }else{
                    response.status(400);
                    response.send("Invalid Todo Priority"); 
                }
            break; 

            case hasStatusProperty(request.query):
                if(status == "TO DO" || status == "IN PROGRESS" || status == "DONE"){
                    getTodosQuery = `SELECT * FROM todo WHERE status = '${status}';`;
                    data = await db.all(getTodosQuery);
                    response.send(data.map((eachItem) => outputResult(eachItem)));
                }else{
                    response.status(400);
                    response.send("Invalid Todo Status"); 
                }
            break; 

            case hasSearchProperty(request.query):
                getTodosQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%';`;
                data = await db.all(getTodosQuery);
                response.send(data.map((eachItem) => outputResult(eachItem))); 
            break; 

            case hasCategoryProperty(request.query):
                if(
                    category == "WORK" ||
                    category == "HOME" ||
                    category == "LEARNING"
                ){
                    getTodosQuery = `SELECT * FROM todo WHERE category = '${category}';`;
                    data = await db.all(getTodosQuery);
                    response.send(data.map((eachItem) => outputResult(eachItem)));

                }else{
                    response.status(400);
                    response.send("Invalid Todo Category");
                }

            break; 
            default:
                getTodosQuery = `SELECT * FROM todo;`;
                data = await db.all(getTodosQuery);
                response.send(data.map((eachItem) => outputResult(eachItem))); 
            }
});

module.exports = app; 