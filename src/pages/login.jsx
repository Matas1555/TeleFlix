import '../css/login.css';

const Login = () => {
    return (
        <div className="login-container">
            <div class="login-box">
                <h2>Login</h2>
                <form action="#" method="post">
            <input type="text" name="username" placeholder="Username" required></input>
            <input type="password" name="password" placeholder="Password" required></input>
            <button type="submit">Login</button>
                </form>
            </div>
        </div>
    );
};

export default Login;