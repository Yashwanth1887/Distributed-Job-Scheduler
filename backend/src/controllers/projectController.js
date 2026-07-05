const db = require("../config/database");

const createProject = (req, res) => {

    const { organization_id, project_name, description } = req.body;

    if (!organization_id || !project_name) {
        return res.status(400).json({
            message: "Organization and project name are required"
        });
    }

    const sql = `
        INSERT INTO projects
        (organization_id, project_name, description)
        VALUES (?, ?, ?)
    `;

    db.query(
        sql,
        [organization_id, project_name, description],
        (err, result) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.status(201).json({
                message: "Project created successfully",
                project_id: result.insertId
            });

        }
    );

};

const getProjects = (req, res) => {

    const sql = `
        SELECT *
        FROM projects
        ORDER BY created_at DESC
    `;

    db.query(sql, (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.json(result);

    });

};

module.exports = {
    createProject,
    getProjects
};