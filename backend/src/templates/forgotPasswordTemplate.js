const forgotPasswordTemplate = (otp, userName = "User") => {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta
                name="viewport"
                content="width=device-width, initial-scale=1.0"
            >
            <title>Reset Password</title>
        </head>

        <body style="
            margin: 0;
            padding: 0;
            background-color: #f4f5f7;
            font-family: Arial, Helvetica, sans-serif;
            color: #2d3542;
        ">
            <table
                role="presentation"
                width="100%"
                cellspacing="0"
                cellpadding="0"
                border="0"
                style="
                    padding: 40px 15px;
                    background-color: #f4f5f7;
                "
            >
                <tr>
                    <td align="center">
                        <table
                            role="presentation"
                            width="600"
                            cellspacing="0"
                            cellpadding="0"
                            border="0"
                            style="
                                max-width: 600px;
                                width: 100%;
                                background-color: #ffffff;
                                border-radius: 12px;
                                overflow: hidden;
                                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
                            "
                        >
                            <!-- Header -->
                            <tr>
                                <td
                                    align="center"
                                    style="
                                        padding: 45px 30px 35px;
                                        background: linear-gradient(
                                            135deg,
                                            #8fc5e8,
                                            #5f9fd0
                                        );
                                    "
                                >
                                    <div style="
                                        width: 90px;
                                        height: 90px;
                                        line-height: 90px;
                                        text-align: center;
                                        background-color: rgba(255, 255, 255, 0.2);
                                        border-radius: 50%;
                                        font-size: 42px;
                                    ">
                                        🔐
                                    </div>

                                    <h1 style="
                                        margin: 25px 0 0;
                                        color: #ffffff;
                                        font-size: 28px;
                                        font-weight: 700;
                                    ">
                                        BeCom
                                    </h1>
                                </td>
                            </tr>

                            <!-- Content -->
                            <tr>
                                <td
                                    align="center"
                                    style="padding: 40px 35px 25px;"
                                >
                                    <h2 style="
                                        margin: 0 0 15px;
                                        font-size: 26px;
                                        color: #2d3542;
                                    ">
                                        Reset Password
                                    </h2>

                                    <p style="
                                        margin: 0 0 15px;
                                        font-size: 15px;
                                        color: #596273;
                                    ">
                                        Hello, <strong>${userName}</strong>
                                    </p>

                                    <p style="
                                        margin: 0 0 30px;
                                        font-size: 15px;
                                        line-height: 1.6;
                                        color: #596273;
                                    ">
                                        We received a request to reset your
                                        BeCom account password. Use the
                                        verification code below to continue.
                                    </p>

                                    <!-- OTP -->
                                    <div style="
                                        display: inline-block;
                                        padding: 18px 30px;
                                        background-color: #f4f8fc;
                                        border: 2px solid #4d8bc9;
                                        border-radius: 10px;
                                        letter-spacing: 12px;
                                        font-size: 30px;
                                        font-weight: bold;
                                        color: #2d5f94;
                                    ">
                                        ${otp}
                                    </div>

                                    <p style="
                                        margin: 25px 0 0;
                                        font-size: 14px;
                                        color: #596273;
                                    ">
                                        This code is valid for
                                        <strong>10 minutes</strong>.
                                    </p>
                                </td>
                            </tr>

                            <!-- Warning -->
                            <tr>
                                <td
                                    align="center"
                                    style="padding: 20px 35px 35px;"
                                >
                                    <p style="
                                        margin: 0;
                                        font-size: 13px;
                                        line-height: 1.6;
                                        color: #7a8391;
                                    ">
                                        Do not share this code with anyone.
                                        BeCom will never ask you for your
                                        verification code.
                                    </p>

                                    <p style="
                                        margin: 20px 0 0;
                                        font-size: 13px;
                                        color: #7a8391;
                                    ">
                                        If you did not request a password reset,
                                        you can safely ignore this email.
                                    </p>
                                </td>
                            </tr>

                            <!-- Footer -->
                            <tr>
                                <td
                                    align="center"
                                    style="
                                        padding: 22px;
                                        background-color: #f7f8fa;
                                    "
                                >
                                    <p style="
                                        margin: 0;
                                        font-size: 12px;
                                        color: #8a93a0;
                                    ">
                                        © ${new Date().getFullYear()} BeCom.
                                        All rights reserved.
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
    `;
};

module.exports = forgotPasswordTemplate;