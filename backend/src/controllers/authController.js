const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/database");

const register = async (req, res) => {
    const { organization_id, full_name, email, password } = req.body;

    if (!organization_id || !full_name || !email || !password) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }

    try {
        const checkUser = "SELECT * FROM users WHERE email = ?";

        db.query(checkUser, [email], async (err, result) => {
            if (err) {
                return res.status(500).json(err);
            }

            if (result.length > 0) {
                return res.status(400).json({
                    message: "Email already exists"
                });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const sql = `
                INSERT INTO users
                (organization_id, full_name, email, password)
                VALUES (?, ?, ?, ?)
            `;

            db.query(
                sql,
                [organization_id, full_name, email, hashedPassword],
                (err) => {
                    if (err) {
                        return res.status(500).json(err);
                    }

                    res.status(201).json({
                        message: "User registered successfully"
                    });
                }
            );
        });

    } catch (error) {
        res.status(500).json(error);
    }
};

const login = (req, res) => {

    const { email, password } = req.body;

    const sql = "SELECT * FROM users WHERE email = ?";

    db.query(sql, [email], async (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        if (result.length === 0) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const user = result[0];

        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({
                message: "Invalid password"
            });
        }

        const token = jwt.sign(
            {
                user_id: user.user_id,
                organization_id: user.organization_id
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        res.json({
            message: "Login successful",
            token
        });

    });

};

module.exports = {
    register,
    login
};