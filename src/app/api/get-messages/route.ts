import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import mongoose from "mongoose";

export async function GET() {  // Removed the unused 'request' parameter
    await dbConnect();

    // Get session
    const session = await getServerSession(authOptions);
    
    // Check if the user is authenticated
    if (!session || !session.user) {
        return new Response(
            JSON.stringify({
                success: false,
                message: "Not Authenticated",
            }),
            { status: 401, headers: { "Content-Type": "application/json" } }
        );
    }

    // Extract user ID from session
    const userId = new mongoose.Types.ObjectId(session.user._id);

    try {
        // Query database for user messages
        const user = await UserModel.aggregate([
            { $match: { _id: userId } },  // Match on `_id` field instead of `id`
            { $unwind: "$messages" },
            { $sort: { "messages.createdAt": -1 } },
            { $group: { _id: "$_id", messages: { $push: "$messages" } } },
        ]);

        // If user not found, respond with 404
        if (!user || user.length === 0) {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: "User not found",
                }),
                { status: 404, headers: { "Content-Type": "application/json" } }
            );
        }

        // Respond with the user's messages
        return new Response(
            JSON.stringify({
                success: true,
                messages: user[0].messages,
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );

    } catch (error) {
        console.error("An unexpected error occurred: ", error);
        
        return new Response(
            JSON.stringify({
                success: false,
                message: "An unexpected error occurred",
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}
