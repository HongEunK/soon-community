const db = require('../database/db');
const util = require('util');
const query = util.promisify(db.query).bind(db);

exports.getAllUsers = async () => {
    const rows = await query('SELECT member_id, name, role FROM member');
    return rows;
};

exports.deleteUser = async (member_id) => {
    const queryStr = 'DELETE FROM member WHERE member_id = ?';
    await query(queryStr, [member_id]);
};

exports.getAllPosts = async () => {
  const sql = `
    SELECT post_id, title, created_date, member_id
    FROM post
    ORDER BY created_date DESC
  `;
  const rows = await query(sql);
  return rows;
};

exports.deletePost = async (post_id) => {
  const queryStr = 'DELETE FROM post WHERE post_id = ?';
  await query(queryStr, [post_id]);
};
