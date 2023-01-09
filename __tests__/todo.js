const request = require("supertest");
var cheerio = require("cheerio");

const db = require("../models/index");
const app = require("../app");

let server, agent;
function extractCsrfToken(res) {
  var $ = cheerio.load(res.text);
  return $("[name=_csrf]").val();
}
const login = async (agent, username, password) => {
  
  let res = await agent.get("/login");
  let csrfToken = extractCsrfToken(res);
  res = await agent.post("/session").send({
    email: username,
    password: password,
    _csrf: csrfToken,
  });
};

describe("Todo Application", function () {
  
  
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
    server = app.listen(6000, () => {});
    agent = request.agent(server);
  });
  afterAll(async () => {
    await db.sequelize.close();
   
    server.close();
  });

  test("Enroll in is working/not", async () => {
    let res = await agent.get("/signup");
    const csrfToken = extractCsrfToken(res);
    
    res = await agent.post("/users").send({
      firstName: "preet",
      
      lastName: "kumar"
      ,
      email: "user@gmail.com",
      password: "12345678",
      _csrf: csrfToken,
    });
    expect(res.statusCode).toBe(302);
  });

  test("Log out is working/not", async () => {
    let res = await agent.get("/todos");
    expect(res.statusCode).toBe(200);
    res = await agent.get("/signout");
    expect(res.statusCode).toBe(302);
    res = await agent.get("/todos");
    expect(res.statusCode).toBe(302);
  });
  
  test("Second user Enrollmentt", async () => {
    let res = await agent.get("/signup");
    const csrfToken = extractCsrfToken(res);
    
    res = await agent.post("/users").send({
      firstName: "kamal",
      
      lastName: "bahadur"
      ,
      email: "user2@gmail.com",
      password: "123456789",
      _csrf: csrfToken,
    });
    expect(res.statusCode).toBe(302);
  });
  test("Creates a new todo for the purpose of working", async () => {
    const agent = request.agent(server);
    await login(agent, "user@gmail.com", "12345678");
    
    const res = await agent.get("/todos");
    const csrfToken = extractCsrfToken(res);
    const response = await agent.post("/todos").send({
      title: "Buy a milk",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });
    expect(response.statusCode).toBe(302);
  });
  

  test("Marking todo as complete", async () => {
    const agent = request.agent(server);
    await login(agent, "user@gmail.com", "12345678");
    let res = await agent.get("/todos");
    let csrfToken = extractCsrfToken(res);
    await agent.post("/todos").send({
      title: "Buy pepsi",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });
    const groupedTodoResponse = await agent
      .get("/todos")
      .set("Accept", "application/json");
    const parsedGroupedResponse = JSON.parse(groupedTodoResponse.text);
    const dueTodayCount = parsedGroupedResponse.dueToday.length;
    const latestTodo = parsedGroupedResponse.dueToday[dueTodayCount - 1];
    const status = latestTodo.completed ? false : true;
    res = await agent.get("/todos");
    csrfToken = extractCsrfToken(res);

    const response = await agent.put(`/todos/${latestTodo.id}`).send({
      _csrf: csrfToken,
      completed: status,
    });
    const parsedUpdateResponse = JSON.parse(response.text);
    expect(parsedUpdateResponse.completed).toBe(true);
  });

  test("Testing todo as incomplete", async () => {
    const agent = request.agent(server);
    await login(agent, "user@gmail.com", "12345678");
    let res = await agent.get("/todos");
    let csrfToken = extractCsrfToken(res);
    await agent.post("/todos").send({
      title: "Buy book",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });
    const groupedTodoResponse = await agent
      .get("/todos")
      .set("Accept", "application/json");
    const parsedGroupedResponse = JSON.parse(groupedTodoResponse.text);
    const dueTodayCount = parsedGroupedResponse.dueToday.length;
    const latestTodo = parsedGroupedResponse.dueToday[dueTodayCount - 1];
    res = await agent.get("/todos");
    csrfToken = extractCsrfToken(res);

    var response = await agent.put(`/todos/${latestTodo.id}`).send({
      _csrf: csrfToken,
      completed: true,
    });
    var parsedUpdateResponse = JSON.parse(response.text);
    expect(parsedUpdateResponse.completed).toBe(true);

    let aga = await agent.get("/todos");
    let csrfToken2 = extractCsrfToken(aga);
    await agent.post("/todos").send({
      _csrf: csrfToken2,
    });

    aga = await agent.get("/todos");
    csrfToken2 = extractCsrfToken(aga);
    response = await agent.put(`/todos/${latestTodo.id}`).send({
      _csrf: csrfToken2,
      completed: false,
    });
    parsedUpdateResponse = JSON.parse(response.text);
    expect(parsedUpdateResponse.completed).toBe(false);
  });

  test("Remove a todo with ID", async () => {
    const agent = request.agent(server);
    await login(agent, "user@gmail.com", "12345678");
    let res = await agent.get("/todos");
    let csrfToken = extractCsrfToken(res);
    await agent.post("/todos").send({
      title: "Buy a pant",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });
    const groupedTodoResponse = await agent
      .get("/todos")
      .set("Accept", "application/json");
    const parsedGroupedResponse = JSON.parse(groupedTodoResponse.text);
    const dueTodayCount = parsedGroupedResponse.dueToday.length;
    const latestTodo = parsedGroupedResponse.dueToday[dueTodayCount - 1];

    res = await agent.get("/todos");
    csrfToken = extractCsrfToken(res);

    const response = await agent.delete(`/todos/${latestTodo.id}`).send({
      _csrf: csrfToken,
    });
    const parsedDeleteResponse = JSON.parse(response.text);
    expect(parsedDeleteResponse.success).toBe(true);
  });
  test("Deleting the one user todo by second user", async () => {
    const firstAgent = request.agent(server);
    await login(firstAgent, "user@gmail.com.com", "12345678");
    let res = await firstAgent.get("/todos");
    let csrfToken = extractCsrfToken(res);
    await firstAgent.post("/todos").send({
      title: "ONe todo",
      dueDate: new Date().toISOString(),
      completed: false,
      _csrf: csrfToken,
    });

    const groupedTodosResponse = await firstAgent
      .get("/todos")
      .set("Accept", "application/json");
    const parsedGroupedResponse = JSON.parse(groupedTodosResponse.text);
    const dueTodayCount = parsedGroupedResponse.dueToday.length;
    const firstUserLatestTodo = parsedGroupedResponse.dueToday[dueTodayCount - 1];

    const secondAgent = request.agent(server);
    await login(secondAgent, "user2@gmail.com", "123456789");

    res = await secondAgent.get("/todos");
    csrfToken = extractCsrfToken(res);
    const deletedResponse = await secondAgent
      .delete(`/todos/${firstUserLatestTodo.id}`)
      .send({
        _csrf: csrfToken,
      });
    const parsedDeletedResponse = JSON.parse(deletedResponse.text);
    expect(parsedDeletedResponse).toBe(false);
  });
});
