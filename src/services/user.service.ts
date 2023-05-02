import { omit, get } from 'lodash';
import { FilterQuery, QueryOptions } from 'mongoose';
import config from 'config';
import userModel, { User } from '../models/user.model';
import { excludedFields } from '../controllers/auth.controller';
import { signJwt } from '../utils/jwt';
import redisClient from '../database/connect-redis';
import { DocumentType } from '@typegoose/typegoose';

// CreateUser service
export const createUser = async (input: Partial<User>) => {
  const user = await userModel.create(input);
  return omit(user.toJSON(), excludedFields);
};

// Find User by Id
export const findUserById = async (id: string) => {
  const user = await userModel.findById(id).lean();
  return omit(user, excludedFields);
};

// Find All users
export const findAllUsers = async () => {
  return await userModel.find();
};

// Find one user by any fields
export const findUser = async (
  query: FilterQuery<User>,
  options: QueryOptions = {}
) => {
  return await userModel.findOne(query, {}, options).select('+password');
};

// Sign Token
export const signToken = async (user: DocumentType<User>) => {
  // Sign the access token
  const access_token = signJwt(
    {
      _id: user._id,
      name: user.name,
      email: user.email
    },
    'accessTokenPrivateKey',
    {
      expiresIn: `${config.get<number>('accessTokenExpiresIn')}m`,
    }
  );

  // Sign the refresh token
  const refresh_token = signJwt(
    {
      _id: user._id,
      name: user.name,
      email: user.email
    }, 
    'refreshTokenPrivateKey', 
    {
      expiresIn: `${config.get<number>('refreshTokenExpiresIn')}m`,
    }
  );

  // Create a Session
  redisClient.set(String(user._id), JSON.stringify({
    _id: user._id,
    name: user.name,
    email: user.email
  }), {
    EX: 60 * 60,
  });

  // Return access token
  return { access_token, refresh_token };
};