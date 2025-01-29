import { MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Logger } from "@nestjs/common";

@WebSocketGateway({cors: {origin: '*'}})
export  class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect{

    @WebSocketServer() 
    server: Server;    

    private logger = new Logger('ChatGateway');

    handleConnection(client: Socket) { //handling connection
        console.log("New user connected..",client.id)

        client.broadcast.emit('user-joined',{  //broadcasting to all the users except the user who joined
            message: `New User Joined the chat: ${client.id}`, 
        });
    }

    
    handleDisconnect(client: Socket) { //handling disconnect event

        console.log("User Disconnected..",client.id)

        this.server.emit('user-left',{
            message: `User Left the chat: ${client.id}`,
        });
    }

    @SubscribeMessage("MessageEvent")
    handleNewMessage(@MessageBody() message: string){
            this.logger.log(`Message recieved: ${message}`);
            this.server.emit('message',message); //broadcast the message to all
            return message;
    }
}

//socket.on()

//socket.emit() -> emitting or replying 

//io.emit() -> broadcasting message to all the users
