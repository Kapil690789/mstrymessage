import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username } = await request.json();
    const decodedUsername = decodeURIComponent(username);
    const user = await UserModel.findOne({ username: decodedUsername });

    if (!user) {
      return Response.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Mark user as verified directly
    user.isVerified = true;
    await user.save();

    return Response.json(
      { success: true, message: 'Account verification skipped' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error skipping verification:', error);
    return Response.json(
      { success: false, message: 'Error skipping verification' },
      { status: 500 }
    );
  }
}
