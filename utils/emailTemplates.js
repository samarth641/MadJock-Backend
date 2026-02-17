export const getOtpEmailTemplate = (otp) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your OTP - MadJock</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f6f9fc;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0,0,0,0.05);
        }
        .header {
            background-color: #000000;
            padding: 30px;
            text-align: center;
        }
        .header img {
            max-width: 150px;
        }
        .content {
            padding: 40px;
        }
        .welcome-text {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 10px;
            color: #000;
        }
        .instruction {
            font-size: 16px;
            line-height: 1.6;
            color: #666;
            margin-bottom: 30px;
        }
        .otp-container {
            background-color: #f8f9fa;
            border: 2px dashed #e0e0e0;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin-bottom: 30px;
        }
        .otp-code {
            font-size: 42px;
            font-weight: 800;
            letter-spacing: 12px;
            color: #000;
            margin: 0;
        }
        .validity {
            font-size: 14px;
            color: #999;
            margin-top: 10px;
        }
        .footer {
            padding: 30px;
            background-color: #fafbfc;
            border-top: 1px solid #eeeeee;
            font-size: 12px;
            color: #999;
            text-align: center;
        }
        .footer a {
            color: #000;
            text-decoration: none;
            font-weight: 600;
        }
        .divider {
            height: 1px;
            background-color: #eeeeee;
            margin: 20px 0;
        }
        .disclaimer {
            font-style: italic;
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <!-- Replace with real logo URL if available, using placeholder for now -->
            <h1 style="color: white; margin: 0; letter-spacing: 2px;">MADJOCK</h1>
        </div>
        <div class="content">
            <div class="welcome-text">Verify Your Identity</div>
            <p class="instruction">
                To authenticate your account, please use the One-Time Password (OTP) below. This code is unique and valid for 5 minutes.
            </p>
            
            <div class="otp-container">
                <div class="otp-code">${otp}</div>
                <div class="validity">Expires in 5 minutes</div>
            </div>

            <p class="instruction" style="font-size: 14px;">
                <strong>Security Reminder:</strong> Never share this OTP with anyone. MadJock representatives will never ask for your login code.
            </p>

            <div class="divider"></div>
            
            <p style="font-size: 14px; color: #666;">
                Thanks for being part of MadJock!<br>
                The MadJock Team
            </p>
        </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} Tark Innovation Private Limited (MadJock)</p>
            <p>Visit us at <a href="https://www.madjock.com">www.madjock.com</a></p>
            <p class="disclaimer">If you didn't request this code, you can safely ignore this email.</p>
        </div>
    </div>
</body>
</html>
`;
