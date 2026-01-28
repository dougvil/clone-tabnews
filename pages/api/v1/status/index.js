import database from '../../../../infra/database';

async function status(req, res) {
  const result = await database.query('SELECT 1+1 as result;');
  console.log(result);
  res.status(200).json({ status: 'OK' });
}

export default status;
