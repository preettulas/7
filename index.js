const app = require('./app');
app.listen(process.env.PORT, ()=>{
  console.log('started express server at 3000');
});
