const registrationOTPTemplate = (otp) => {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta
                name="viewport"
                content="width=device-width, initial-scale=1.0"
            >
            <title>Verify Your Email</title>
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
                            "
                        >
                            <tr>
                                <td
                                    align="center"
                                    style="
                                        padding: 45px 30px 35px;
                                        background: #5f9fd0;
                                    "
                                >
                                    <div style="
                                        font-size: 42px;
                                    ">
                                        ✉️
                                    </div>

                                    <h1 style="
                                        margin: 20px 0 0;
                                        color: #ffffff;
                                        font-size: 28px;
                                    ">
                                        Welcome to BeCom
                                    </h1>
                                </td>
                            </tr>

                            <tr>
                                <td
                                    align="center"
                                    style="padding: 40px 35px;"
                                >
                                    <h2 style="
                                        margin: 0 0 15px;
                                        font-size: 26px;
                                        color: #2d3542;
                                    ">
                                        Verify Your Email
                                    </h2>

                                    <p style="
                                        margin: 0 0 30px;
                                        font-size: 15px;
                                        line-height: 1.6;
                                        color: #596273;
                                    ">
                                        Thank you for creating a BeCom account.
                                        Use the verification code below to
                                        complete your registration.
                                    </p>

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

                                    <p style="
                                        margin: 20px 0 0;
                                        font-size: 13px;
                                        color: #7a8391;
                                    ">
                                        Do not share this verification code
                                        with anyone.
                                    </p>
                                </td>
                            </tr>

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

module.exports = registrationOTPTemplate;