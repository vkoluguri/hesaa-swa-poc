module.exports = async function (context, req) {
  context.log("Ping called");
  context.res = {
    status: 200,
    headers: { "Content-Type": "application/json" },
    body: {
      ok: true,
      message: "pong",
      time: new Date().toISOString()
    }
  };
};
