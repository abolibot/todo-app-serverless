import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import {
  createAttachmentPresignedUrl,
  todoItemExists
} from '../../helpers/todos'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
    const validTodoId = await todoItemExists(event, todoId)

    if (!validTodoId) {
      return {
        statusCode: 404,
        // headers: {
        //   'Access-Control-Allow-Origin': '*',
        //   'Access-Control-Allow-Credentials': true
        // },
        body: JSON.stringify({
          error: 'Todo item does not exist'
        })
      }
    }

    const url = await createAttachmentPresignedUrl(event, todoId)

    return {
      statusCode: 200,
      body: JSON.stringify({ uploadUrl: url })
    }
  }
)

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true
  })
)
