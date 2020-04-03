import * as functions from 'firebase-functions';
import * as express from 'express';
import { db } from "./init";
import * as firebaseHelper from 'firebase-functions-helper';

const cors = require('cors');

const app = express();
app.use(cors({origin: true}));

interface UserInfo {
    appName: string
    level: number
    sessionTime: number
    userId: string
    world: number
    adId: string
    dateStamp: string
    skills: string
}

const logsCollection = 'logs';

app.get('/logs', async (request, response) => {
    const snaps = await db.collection(logsCollection).get();
    const logs = [];
    snaps.forEach(snap => {
        const item: any = snap.data();
        // @ts-ignore
        logs.push(item);
    });
    response.status(200).json({logs});
});

app.post('/logs', async (request, response) => {
    try {
        const userInfo: UserInfo = {
            adId       : request.body['adId'],
            level      : request.body['level'],
            sessionTime: request.body['sessionTime'],
            userId     : request.body['userId'],
            appName    : request.body['appName'],
            world      : request.body['world'],
            dateStamp  : request.body['dateStamp'],
            skills     : request.body['skills']
        };

        const key = userInfo.dateStamp + '|' + userInfo.userId;
        // let dateRef = db.collection(logsCollection).doc(key);
        //
        // await dateRef.set({
        //     adId: userInfo.adId,
        //     level: userInfo.level,
        //     sessionTime: userInfo.sessionTime,
        //     appName: userInfo.appName,
        //     world: userInfo.world,
        //     dateStamp: userInfo.adId,
        // }, {merge: true});
        //
        await firebaseHelper.firestore
            .createDocumentWithID(db, logsCollection, key, userInfo);
        response.status(201).send(`Created a Log: ${userInfo.dateStamp}|${userInfo.adId}`);
    } catch (error) {
        response.status(400).send(`Error ${error}`);
    }
});

// View a log
app.get('/logs/:id', (req, res) => {
    firebaseHelper.firestore
        .getDocument(db, logsCollection, req.params.id)
        .then(doc => res.status(200).send(doc))
        .catch(error => res.status(400).send(`Cannot get contact: ${error}`));
});

export const fns = functions.https.onRequest(app);
