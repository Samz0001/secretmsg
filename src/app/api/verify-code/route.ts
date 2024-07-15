import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export async function POST(request: Request) {
  await dbConnect();
  try {
    const { username, code } = await request.json();

    const decodeUsername = decodeURIComponent(username);
    const user = await UserModel.findOne({ username: decodeUsername });
    if (!user) {
      return Response.json(
        {
          success: false,
          message: "USer Not Found",
        },
        { status: 500 }
      );
    }

    const isCodeValid = user.verifyCode === code;
    const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();
    if (isCodeValid && isCodeNotExpired) {
      user.isVerified = true;
      await user.save();

      return Response.json(
        {
          success: true,
          message: "Account verified successfully",
        },
        { status: 200 }
      );
    } else if (!isCodeNotExpired) {
      return Response.json(
        {
          success: false,
          message:
            "VErification code has expired please sign up again to get a new code",
        },
        { status: 400 }
      );
    } else {
      return Response.json(
        {
          success: false,
          message: "Verification code is Incorrect",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error Checking USername", error);
    return Response.json(
      {
        success: false,
        message: "Error verifiying username",
      },
      { status: 500 }
    );
  }
}
