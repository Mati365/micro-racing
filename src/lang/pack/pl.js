import {ERROR_CODES} from '../../network/constants/serverCodes';

export default {
  editor: {
    titles: {
      save: 'Zapisz',
      load: 'Wczytaj',
    },
  },
  game: {
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
        update: 'Zaktualizuj',
        sending: 'Wysyłanie...',
      },

      rooms_list: {
        header: 'Lista pokojów',
        create_room: 'Stwórz pokój',
        creating_room: 'Tworzenie pokoju',
      },

      room_edit: {
        header: 'Pokój:',
        predefined_maps: 'Wybierz inne mapy:',
        leave: 'Opuść pokój',
        edit_road: 'Edytuj tor',

        tabs: {
          chat: 'Czat',
          players: 'Obecni',
          settings: 'Opcje',
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
