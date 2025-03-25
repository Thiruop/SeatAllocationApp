import axios from "axios";

export const Signin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const response = await axios.post(`https://${process.env.AUTH0_DOMAIN}/oauth/token`, {
            grant_type: "http://auth0.com/oauth/grant-type/password-realm",
            client_id: process.env.AUTH0_CLIENT_ID,
            client_secret: process.env.AUTH0_CLIENT_SECRET,
            audience: process.env.AUTH0_AUDIENCE,
            username: email,
            password: password,
            realm: "Username-Password-Authentication",
            scope: "openid profile email",
        });
        
        res.json({ success: true, token: response.data.access_token, user: response.data });
    } catch (error) {
        console.error("Auth0 login failed:", error.response?.data || error.message);
        res.status(401).json({ success: false, error: "Invalid credentials" });
    }
};

export const SignUp = async (req, res) => {
    const { email, password, name } = req.body;

    try {
        const tokenResponse = await axios.post(`https://${process.env.AUTH0_DOMAIN}/oauth/token`, {
            client_id: process.env.AUTH0_CLIENT_ID,
            client_secret: process.env.AUTH0_CLIENT_SECRET,
            audience: `https://${process.env.AUTH0_DOMAIN}/api/v2/`,
            grant_type: "client_credentials",
        });

        const managementToken = tokenResponse.data.access_token;

        // Create a new user in Auth0
        const userResponse = await axios.post(
            `https://${process.env.AUTH0_DOMAIN}/api/v2/users`,
            {
                email: email,
                password: password,
                name: name,
                connection: "Username-Password-Authentication",
            },
            {
                headers: {
                    Authorization: `Bearer ${managementToken}`,
                    "Content-Type": "application/json",
                },
            }
        );
        res.json({ success: true, user: userResponse.data });
    } catch (error) {
        console.error("Auth0 Signup Error:", error.response?.data || error.message);
        res.status(400).json({ success: false, error: error.response?.data?.message || "Signup failed" });
    }
};

export const Logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: "Logout failed" });
        }
        res.redirect(
            `https://${process.env.AUTH0_DOMAIN}/v2/logout?client_id=${process.env.AUTH0_CLIENT_ID}&returnTo=${process.env.CLIENT_ORIGIN || "http://localhost:3000"}`
        );
    });
};
