import { TodoAccess } from './todosAcess'
import { AttachmentUtils } from './attachmentUtils'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import * as uuid from 'uuid'

import { getUserId } from '../lambda/utils'
import { APIGatewayProxyEvent } from 'aws-lambda'

// TODO: Implement businessLogic
const todoAccess = new TodoAccess()
const attachmentUtils = new AttachmentUtils()

export async function createTodo(
  createTodoRequest: CreateTodoRequest,
  event: APIGatewayProxyEvent
): Promise<TodoItem> {
  const itemId = uuid.v4()
  const userId = getUserId(event)

  return await todoAccess.createTodoItem({
    userId: userId,
    todoId: itemId,
    createdAt: new Date().toISOString(),
    name: createTodoRequest.name,
    dueDate: createTodoRequest.dueDate,
    done: false,
    attachmentUrl: null
  })
}

export async function getTodosForUser(
  event: APIGatewayProxyEvent
): Promise<TodoItem[]> {
  const userId = getUserId(event)

  return await todoAccess.getTodosForUser(userId)
}

export async function todoItemExists(
  event: APIGatewayProxyEvent,
  todoItemId: string
): Promise<Boolean> {
  const userId = getUserId(event)

  return await todoAccess.todoItemExists(userId, todoItemId)
}

export async function createAttachmentPresignedUrl(
  event: APIGatewayProxyEvent,
  todoItemId: string
): Promise<string> {
  const userId = getUserId(event)

  return await attachmentUtils.getUploadUrl(userId, todoItemId)
}

export async function deleteTodoItem(
  event: APIGatewayProxyEvent,
  todoItemId: string
): Promise<void> {
  const userId = getUserId(event)

  await todoAccess.deleteTodoItem(userId, todoItemId)
}

export async function updateTodoItem(
  event: APIGatewayProxyEvent,
  todoItemId: string,
  updateTodoRequest: UpdateTodoRequest
): Promise<void> {
  const userId = getUserId(event)

  await todoAccess.updateTodoItem(userId, todoItemId, {
    name: updateTodoRequest.name,
    dueDate: updateTodoRequest.dueDate,
    done: updateTodoRequest.done
  })
}
