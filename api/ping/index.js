module.exports = async function (context, req) {
  return { status: 200, body: JSON.stringify({ ok: true, message: "pong" }) };
};
