import { Router } from "express";
import { createEvent, getEventsByGroupId } from "../controller/event.controller";

const groupEventRouter = Router()

groupEventRouter.post('/:groupId', createEvent)
groupEventRouter.get('/:groupId', getEventsByGroupId)

export default groupEventRouter;