import {
  ERROR_CODES,
  ROOM_SERVER_MESSAGES_TYPES,
} from '../../network/constants/serverCodes';

export default {
  editor: {
    titles: {
      save: 'Save',
      load: 'Load',
    },
  },
  game: {
    shared: {
      loading: 'Loading...',
    },
    errors: {
      [ERROR_CODES.ROOM_FULL]: 'Room is full!',
      [ERROR_CODES.ROOM_ALREADY_EXISTS]: 'Room already exists!',
      [ERROR_CODES.ALREADY_KICKED]: 'Ban!',
      [ERROR_CODES.ACCESS_DENIED]: 'Access denied!',
      [ERROR_CODES.UNEXPECTED_ERROR]: 'Unexpected error!',
      [ERROR_CODES.RACING_ALREADY_ACTIVE]: 'Race is active!',
      undefined: 'Undefined error!',
    },
    screens: {
      loading: {
        header: 'Connecting...',
      },

      choose_config: {
        headers: {
          car: 'Choose car',
          nick: 'Choose nick',
        },
        play: 'Play',
        start_race: 'Start race!',
        update: 'Update',
        sending: 'Sending...',
      },

      rooms_list: {
        header: 'Rooms list',
        create_room: 'Create room',
        creating_room: 'Creating room',
      },

      score: {
        header: 'Score',
        next_button: 'Next',
        columns: {
          position: 'Position',
          kind: 'Kind',
          nick: 'Nick',
          nth_lap_time: 'Lap %{}',
          total_time: 'Race time',
        },
      },

      room_edit: {
        header: 'Room:',
        predefined_maps: 'Choose other roads:',
        leave: 'Leave room',
        edit_road: 'Edit road',
        save_road: 'Use road',
        discard_road: 'Discard road',
        stop_race: 'Stop race',

        tabs: {
          score: 'Score',
          chat: 'Chat',
          players: 'Players',
          banned: 'Banned',
          settings: 'Settings',
        },

        players_list: {
          ops: 'Administrator:',
          in_race: 'Players:',
          observers: 'Observers:',
        },

        banned_list: {
          list_title: 'Banned:',
          no_banned: 'Nobody banned :)',
          unban: 'Unban',
        },

        race_config: {
          players_count: 'Players count:',
          laps_count: 'Laps count:',
          countdown: 'Countdown (s):',
          spawn_bots: 'Spawn bots',
        },

        score_list: {
          header: 'Score',
        },
      },

      racing: {
        leave_room: 'Leave room',
        stop_racing: 'Stop race',
      },

      chat: {
        type_message: 'Type message...',
        send: 'Send',

        server_nick: 'Server',
        server_messages: {
          [ROOM_SERVER_MESSAGES_TYPES.PLAYER_CREATED_ROOM]: '%{} created room!',
          [ROOM_SERVER_MESSAGES_TYPES.PLAYER_JOIN]: 'player %{} joined!',
          [ROOM_SERVER_MESSAGES_TYPES.PLAYER_LEFT]: 'player %{} left!',
          [ROOM_SERVER_MESSAGES_TYPES.PLAYER_KICK]: 'player %{} kicked!',
          [ROOM_SERVER_MESSAGES_TYPES.PLAYER_RENAME]: 'player %{} changed nick to %{}!',
        },
      },
    },

    keyboard: {
      controls: 'Steering',
      throttle: 'Throttle',
      brake: 'Brake',
      turnLeft: 'Turn left',
      turnRight: 'Turn right',
    },

    racing: {
      current_lap: 'lap:',
      race_starts_in: 'The race will start in %{} seconds!',
      waiting_for_server: 'Loading...',
    },
  },
};
