import { MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";


@WebSocketGateway({cors: {origin: '*'}})
export  class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect{

    @WebSocketServer() server: Server;    

    handleConnection(client: Socket) {
        console.log("New user connected..",client.id)

        client.broadcast.emit('user-joined',{
            message: `New User Joined the chat: ${client.id}`, 
        });
    }

    handleDisconnect(client: Socket) {
        console.log("User Disconnected..",client.id)

        this.server.emit('user-left',{
            message: `User Left the chat: ${client.id}`,
        });
    }

    @SubscribeMessage("MessageEvent")
    handleNewMessage(@MessageBody() message: string){

            this.server.emit('message',message); //broadcast the message to all
    }
}

//socket.on()

//socket.emit() -> emitting or replying 

//io.emit() -> broadcasting message to all the users
