interface ChangeNameCommand {
  commandName: 'ChangeName';
  name: string;
}

interface IncreaseCountCommand {
  commandName: 'IncreaseCount';
}

export type ServerCommand = ChangeNameCommand | IncreaseCountCommand;