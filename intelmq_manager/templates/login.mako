<%inherit file="base.mako" />


<!-- Page Content -->
<div id="page-wrapper">
    <div id="login-page">
        <div id="login-card">
            <h4 class=" w-100 font-weight-bold">Log in</h4>
            <form method="POST" id="loginForm">
                <div class="mx-3">
                    <!-- Field to show if the username or password is wrong -->
                    <p class="text-danger" id="loginErrorField"> </p>
                    <div class="md-form mb-2">
                        <label data-error="wrong" data-success="right" for="username">
                            Username
                        </label>
                        <input type="text" id="username" name="username" class="form-control">
                    </div>
                    <div class="md-form mb-2">
                        <label data-error="wrong" data-success="right" for="password">
                            Password
                        </label>
                        <input type="password" id="password" name="password" class="form-control">
                    </div>

                </div>
                <div class="d-flex justify-content-center">
                    <button class="btn btn-primary pull-right">Login</button>
                </div>
            </form>
        </div>
    </div>
</div>