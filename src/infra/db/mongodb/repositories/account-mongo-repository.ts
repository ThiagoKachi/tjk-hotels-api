import { AddFavoriteContactRepository } from '@data/protocols/db/account/add-favorite-contact';
import { AddAccountRepository } from '@data/protocols/db/account/auth/add-account-repository';
import { ChangeStatusRepository } from '@data/protocols/db/account/change-status';
import { LoadAccountByEmailRepository } from '@data/protocols/db/account/load-account-by-email';
import { LoadAccountByIdRepository } from '@data/protocols/db/account/load-account-by-id';
import { LoadAccountsRepository } from '@data/protocols/db/account/load-accounts';
import { LoadFavoriteContactsRepository } from '@data/protocols/db/account/load-favorite-contacts';
import { Account, ICreateAccount } from '@domain/models/account/account';
import { UserStatus } from '@domain/models/account/user-status';
import { ILoadAccounts } from '@domain/usecases/account/load-accounts';
import { RemoveFavoriteContact } from '@domain/usecases/account/remove-favorite-contact';
import { AccountModel } from '@infra/db/mongodb/schemas/account-schema';
import { ConversationModel } from '../schemas/conversation-schema';

export class AccountMongoRepository implements AddAccountRepository, LoadAccountByEmailRepository, LoadAccountsRepository, LoadAccountByIdRepository, ChangeStatusRepository, AddFavoriteContactRepository, RemoveFavoriteContact, LoadFavoriteContactsRepository {
  async loadFavorites(accountId: string): Promise<Account[]> {
    const accounts = await AccountModel.findById(accountId)
      .populate('favoritesContacts')
      .select('favoritesContacts');

    return accounts.favoritesContacts;
  }

  async removeFavorite(accountId: string, contactId: string): Promise<void> {
    await AccountModel.updateOne(
      { _id: accountId },
      { $pull: { favoritesContacts: contactId } }
    );
  }
  async addFavorite(userId: string, contactId: string): Promise<void> {
    await AccountModel
      .updateOne({ _id: userId }, { $push: { favoritesContacts: contactId } });
  }

  async change(accountId: string, status: UserStatus): Promise<void> {
    await AccountModel.updateOne({ _id: accountId }, { $set: { status } });
  }

  async loadById(id: string): Promise<Account> {
    const account = await AccountModel.findById(id);

    return account;
  }

  async load({ conversationId, inGroup }: ILoadAccounts): Promise<Account[]> {
    if (!conversationId) {
      return await AccountModel.find();
    }

    const conversation = await ConversationModel.findById(conversationId);

    const participantIds = conversation.participants
      .map((participant: { _id: string }) => participant._id.toString());

    let filter = {};

    if (inGroup === true) {
      filter = { _id: { $in: participantIds } };
    } else if (inGroup === false) {
      filter = { _id: { $nin: participantIds } };
    }

    return await AccountModel.find(filter);
  }

  async loadByEmail(email: string): Promise<Account> {
    const account = await AccountModel.findOne({ email });

    return account;
  }

  async create(accountData: ICreateAccount): Promise<Account> {
    const newAccount = new AccountModel(accountData);

    const savedAccount = await newAccount.save();

    return savedAccount;
  }
}
