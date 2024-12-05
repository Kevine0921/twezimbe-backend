import { ObjectId } from "mongodb";
import { model, Schema } from "mongoose";


export interface IGroupUpgrade {
    userId: ObjectId; // Reference to the User
    groupId: ObjectId; // Reference to the Group
    plan: string;      // The plan name or type
    amount: number;    // The amount for the upgrade
}


const GroupUpgradeSchema = new Schema({
    userId: { type: ObjectId, ref: "User", required: true },
    groupId: { type: ObjectId, ref: "Group", required: true },
    plan: { type: String, required: true },
    amount: { type: Number, required: true }
}, {
    timestamps: true
});

const GroupUpgrade = model("GroupUpgrade", GroupUpgradeSchema);
export default GroupUpgrade;
