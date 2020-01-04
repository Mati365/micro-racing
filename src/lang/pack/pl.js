import {
  ERROR_CODES,
  ROOM_SERVER_MESSAGES_TYPES,
} from '../../network/constants/serverCodes';

export default {
  editor: {
    titles: {
      save: 'Zapisz',
      load: 'Wczytaj',
    },
  },
  game: {
    shared: {
      loading: 'Wczytywanie...',
    },
    errors: {
      [ERROR_CODES.ROOM_FULL]: 'Pokój / serwer jest pełny!',
      [ERROR_CODES.ROOM_ALREADY_EXISTS]: 'Podany pokój już istnieje!',
      [ERROR_CODES.ALREADY_KICKED]: 'Dostęp zabroniony, ban!',
      [ERROR_CODES.ACCESS_DENIED]: 'Dostęp zabroniony!',
      [ERROR_CODES.UNEXPECTED_ERROR]: 'Nieprzewidziany błąd serwera!',
      [ERROR_CODES.RACING_ALREADY_ACTIVE]: 'Wyścig już trwa!',
      undefined: 'Niezdefiniowany błąd!',
    },
    screens: {
      loading: {
        header: 'Łączenie...',
      },

      choose_config: {
        headers: {
          car: 'Wybierz auto',
          nick: 'Wybierz nick',
        },
        play: 'Graj',
        start_race: 'Start wyścigu',
        update: 'Zaktualizuj',
        sending: 'Wysyłanie...',
      },

      rooms_list: {
        header: 'Lista pokojów',
        create_room: 'Stwórz pokój',
        creating_room: 'Tworzenie pokoju',
      },

      score: {
        header: 'Wyniki',
        next_button: 'Dalej',
        columns: {
          position: 'Pozycja',
          kind: 'Typ',
          nick: 'Nick',
          nth_lap_time: 'Okrążenie %{}',
          total_time: 'Czas wyścigu',
        },
      },

      room_edit: {
        header: 'Pokój:',
        predefined_maps: 'Wybierz inne tory:',
        leave: 'Opuść pokój',
        edit_road: 'Edytuj tor',
        save_road: 'Użyj toru',
        discard_road: 'Odrzuć zmiany',
        stop_race: 'Zatrzymaj wyścig',

        tabs: {
          score: 'Ranking',
          chat: 'Chat',
          players: 'Obecni',
          banned: 'Zbanowani',
          settings: 'Opcje',
        },

        players_list: {
          ops: 'Administrator:',
          in_race: 'Gracze:',
          observers: 'Obserwatorzy:',
        },

        banned_list: {
          list_title: 'Zbanowani:',
          no_banned: 'Brak zbanowanych :)',
          unban: 'Odbanuj',
        },

        race_config: {
          players_count: 'Ilość graczy:',
          laps_count: 'Ilość okrążeń:',
          countdown: 'Odliczaj (s):',
          spawn_bots: 'Spawnuj boty',
        },

        score_list: {
          header: 'Wyniki',
        },
      },

      racing: {
        leave_room: 'Opuść pokój',
        stop_racing: 'Zatrzymaj wyścig',
      },

      chat: {
        type_message: 'Wpisz wiadomość...',
        send: 'Wyślij',

        server_nick: 'Serwer',
        server_messages: {
          [ROOM_SERVER_MESSAGES_TYPES.PLAYER_CREATED_ROOM]: '%{} utworzył pokój!',
          [ROOM_SERVER_MESSAGES_TYPES.PLAYER_JOIN]: 'przyszedł %{}!',
          [ROOM_SERVER_MESSAGES_TYPES.PLAYER_LEFT]: 'odszedł %{}!',
          [ROOM_SERVER_MESSAGES_TYPES.PLAYER_KICK]: 'gracz %{} wykopany!',
          [ROOM_SERVER_MESSAGES_TYPES.PLAYER_RENAME]: 'gracz %{} zmienił nick na %{}!',
        },
      },
    },

    keyboard: {
      controls: 'Sterowanie',
      throttle: 'Przyśpiesz',
      brake: 'Hamuj',
      turnLeft: 'Skręć w lewo',
      turnRight: 'Skręć w prawo',
    },

    racing: {
      current_lap: 'okrążenie:',
      race_starts_in: 'Wyścig zacznie się za %{} sekund!',
      waiting_for_server: 'Wczytywanie...',
    },
  },
};
