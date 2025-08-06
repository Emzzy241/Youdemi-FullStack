// Function to generate the HTML for the verification email
export const getVerificationEmailTemplate = (userName, verificationCode, expiryTimeInMinutes) => {
    // Return the HTML content using a template literal
    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <div style="text-align: center; padding-bottom: 20px;">
                <img src="https://userway.org/blog/wp-content/uploads/2022/05/Online-School-Programs-1024x576.jpg" alt="Company Logo" style="max-width: 150px;">
            </div>
            <h2 style="color: #333333;">Hello ${userName},</h2>
            <p style="font-size: 16px; color: #555555;">
                Thank you for signing up with our service. To complete your account verification, please use the code below:
            </p>
            <div style="text-align: center; margin: 30px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #007BFF; background-color: #f0f8ff; padding: 15px 25px; border-radius: 8px; border: 1px solid #007BFF;">
                    ${verificationCode}
                </span>
            </div>
            <p style="font-size: 14px; color: #888888;">
                This code is valid for ${expiryTimeInMinutes} minutes. If you did not request this, you can safely ignore this email.
            </p>
            <div style="border-top: 1px solid #e0e0e0; margin-top: 20px; padding-top: 15px; text-align: center;">
                <p style="font-size: 12px; color: #888888;">
                    © ${new Date().getFullYear()} Youdemi Inc. All rights reserved.
                </p>
            </div>
        </div>
    `;
};