import asyncWrapper from "../middlewares/AsyncWrapper";
import { ValidateToken } from "../utils/password.utils";
import Event from "../model/event.model"
import { UserDoc } from "../model/user.model";
import UserGroup from "../model/user_group.model";
import { RoleDoc } from "../model/role.model";
import { sendEmail } from "../utils/notification.utils";
import { scheduleJob } from "node-schedule";

export const createEvent = asyncWrapper(async (req, res) => {
    const isTokenValid = await ValidateToken(req);
    if (!isTokenValid) return res.status(403).json({ errors: "Access denied" });

    const { type, title, description, date, userId, groupId } = req.body;

    try {
        // Create the new event
        const newEvent = await Event.create({
            userId,
            groupId,
            title,
            description,
            date,
            type: type || 'Custom'
        });

        // Get group members
        const members = await getGroupMembers(groupId);

        // Customize email content based on event type
        const getEmailContent = (type: string) => {
            switch (type) {
                case "Birthday":
                    return {
                        emailTitle: `🎉 Birthday Celebration: ${title}`,
                        emailMessageBody: `Join us to celebrate a special birthday! Details: ${description}. Date: ${date}.`
                    };
                case "Anniversary":
                    return {
                        emailTitle: `🎊 Anniversary Event: ${title}`,
                        emailMessageBody: `We are excited to celebrate this anniversary with you! Details: ${description}. Date: ${date}.`
                    };
                case "Conference":
                    return {
                        emailTitle: `📢 Conference: ${title}`,
                        emailMessageBody: `Join us for an insightful conference. Details: ${description}. Date: ${date}.`
                    };
                default:
                    return {
                        emailTitle: `📅 Event: ${title}`,
                        emailMessageBody: `You're invited to an event! Details: ${description}. Date: ${date}.`
                    };
            }
        };

        const { emailTitle, emailMessageBody } = getEmailContent(type);

        // Schedule emails for all members
        for (let member of members) {
            const email = member.email;

            // Convert event date to a valid JavaScript Date object
            const eventDate = new Date(date);

            // Schedule the email to be sent one day before the event
            const emailSendDate = new Date(eventDate);
            emailSendDate.setDate(emailSendDate.getDate() - 1);

            scheduleJob(emailSendDate, () => {
                sendEmail(email, emailTitle, emailMessageBody);
            });
        }

        res.status(201).json({
            status: true,
            event: newEvent
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ errors: 'Server error' });
    }
});


export const getEventsByGroupId = asyncWrapper(async (req, res) => {
    const isTokenValid = await ValidateToken(req);
    if (!isTokenValid) return res.status(403).json({ errors: "Access denied" });

    const { groupId } = req.params;

    console.log(groupId, req.params, "groupId")
    try {
        // Find events by the groupId and populate the user field
        const events = await Event.find({ groupId })
            .populate('userId', 'username');

        if (events.length === 0) {
            return res.status(404).json({ errors: 'No events found for this group.' });
        }

        res.status(200).json({
            status: true,
            events
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ errors: 'Server error' });
    }
});



export const getGroupMembers = async (groupId: string) => {

    try {
        // Fetch User-Group relationship with populated fields
        const userGroups = await UserGroup.find({ group_id: groupId })
            .populate("user_id", "firstName lastName profile_pic email") // Populate user fields
            .populate("role_id", "role_name") // Populate role fields
            .populate("group_id", "name"); // Populate group fields


        // Map userGroups to a cleaner structure
        const members = userGroups.map((group) => {
            const user = group.user_id as UserDoc; // User document
            const role = group.role_id as RoleDoc; // Role document

            return {
                userId: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                profile_pic: user.profile_pic,
                email: user.email,
                role: role?.role_name || "Member",
            };
        });

        return members
    } catch (error) {
        console.error(`Error fetching group members for groupId ${groupId}:`, error);
        throw new Error("Failed to fetch group members. Please try again later.");
    }
}
