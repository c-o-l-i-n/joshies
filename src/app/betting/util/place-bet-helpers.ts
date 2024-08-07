import { EventTeamWithParticipantInfo } from '../../shared/data-access/event.service';
import { PlayerWithUserAndRankInfo } from '../../shared/data-access/player.service';
import { getFormattedParticipantList } from '../../shared/util/event-helpers';
import { BetSubtype, BetType } from '../../shared/util/supabase-helpers';
import {
  ChaosSpaceEventModel,
  DuelModel,
  EventModel,
  EventTeamModel,
  EveryoneLosesPercentageOfTheirPointsBasedOnTaskFailureSpecialSpaceEffectData,
  GameboardSpaceModel,
  PlayerGainsPointsBasedOnGameScoreSpecialSpaceEventDetails,
  PlayerModel,
  SpecialSpaceEventModel,
} from '../../shared/util/supabase-types';

export function generateBetDetails(
  betType: BetType,
  duel: DuelModel | null,
  winner: PlayerWithUserAndRankInfo | null,
  ssEvent: SpecialSpaceEventModel | null | undefined,
  ouOption: 'OVER' | 'UNDER',
  ouValue: number,
  chaosBetSubtype: BetSubtype,
  chaosEvent: ChaosSpaceEventModel | null | undefined,
  chaosPlayer: PlayerWithUserAndRankInfo | null,
  winsLoses: 'WINS' | 'LOSES',
  eventTeam: EventTeamWithParticipantInfo | null,
  topBottomOption: 'TOP' | 'BOTTOM',
  numberOfTeams: number,
  event: EventModel | null,
  eventBetSubtype: BetSubtype,
  gameboardPlayer: PlayerWithUserAndRankInfo | null,
  gameboardSpace: GameboardSpaceModel | null,
): BetDetails {
  switch (betType) {
    case BetType.DuelWinner:
      return {
        duelId: duel?.id ?? 0,
        challengerWins: winner?.player_id === duel?.challenger?.player_id,
      };
    case BetType.SpecialSpaceEvent:
      return {
        ssEventId: ssEvent?.id ?? 0,
        directionIsOver: ouOption === 'OVER',
        ouValue: ouValue ?? 0.5,
      };
    case BetType.ChaosSpaceEvent:
      if (chaosBetSubtype === BetSubtype.PlayerLoses) {
        return {
          chaosEventId: chaosEvent?.id ?? 0,
          subtype: BetSubtype.PlayerLoses,
          playerId: chaosPlayer?.player_id ?? 0,
          isLoser: winsLoses === 'LOSES',
        };
      }
      if (chaosBetSubtype === BetSubtype.NumberOfLosers) {
        return {
          chaosEventId: chaosEvent?.id ?? 0,
          subtype: BetSubtype.NumberOfLosers,
          directionIsOver: ouOption === 'OVER',
          ouValue: ouValue ?? 0.5,
        };
      }
      return {};
    case BetType.MainEvent:
      if (eventBetSubtype === BetSubtype.TeamPosition) {
        return {
          eventId: event?.id ?? 0,
          teamId: eventTeam?.id ?? 0,
          subtype: BetSubtype.TeamPosition,
          directionIsTop: topBottomOption === 'TOP',
          numberOfTeams: numberOfTeams ?? 1,
        };
      }
      if (eventBetSubtype === BetSubtype.Score) {
        return {
          eventId: event?.id ?? 0,
          teamId: eventTeam?.id ?? 0,
          subtype: BetSubtype.Score,
          directionIsOver: ouOption === 'OVER',
          ouValue: ouValue,
        };
      }
      return {};
    case BetType.GameboardMove:
      return {
        playerId: gameboardPlayer?.player_id ?? 0,
        gameboardSpaceId: gameboardSpace?.id ?? 0,
      };
    default:
      return {};
  }
}

export function generateBetDescription(
  betType: BetType,
  duel: DuelModel | null,
  winner: PlayerWithUserAndRankInfo | null,
  ssEvent: SpecialSpaceEventModel | null | undefined,
  ouOption: 'OVER' | 'UNDER',
  ouValue: number,
  terms: string = '',
  chaosBetSubtype: BetSubtype,
  chaosEvent: ChaosSpaceEventModel | null | undefined,
  chaosPlayer: PlayerWithUserAndRankInfo | null,
  winsLoses: 'WINS' | 'LOSES',
  team: EventTeamWithParticipantInfo | null,
  topBottomOption: 'TOP' | 'BOTTOM',
  numberOfTeams: number,
  event: EventModel | null,
  eventBetSubtype: BetSubtype,
  gameboardPlayer: PlayerWithUserAndRankInfo | null,
  gameboardSpace: GameboardSpaceModel | null,
) {
  const singularOuValue = ouValue === 1;

  switch (betType) {
    case BetType.DuelWinner:
      const loserName =
        winner?.player_id === duel?.challenger?.player_id
          ? duel?.opponent?.display_name
          : duel?.challenger?.display_name;
      return `${winner?.display_name} beats ${loserName} in ${duel?.game_name}`;

    case BetType.SpecialSpaceEvent:
      return `${ssEvent?.player?.display_name} gets ${ouOption} ${ouValue} ${(ssEvent?.template?.details as PlayerGainsPointsBasedOnGameScoreSpecialSpaceEventDetails | undefined)?.[singularOuValue ? 'pointsLabelSingular' : 'pointsLabelPlural']} in ${ssEvent?.template?.name}`;

    case BetType.ChaosSpaceEvent:
      const taskName = (
        chaosEvent?.template?.details as
          | EveryoneLosesPercentageOfTheirPointsBasedOnTaskFailureSpecialSpaceEffectData
          | undefined
      )?.taskName;
      if (chaosBetSubtype === BetSubtype.PlayerLoses) {
        return `${chaosPlayer?.display_name} ${winsLoses === 'WINS' ? 'will successfully' : 'fails to'} ${taskName}`;
      }
      if (chaosBetSubtype === BetSubtype.NumberOfLosers) {
        return `${ouOption} ${ouValue} ${singularOuValue ? 'player' : 'players'} ${singularOuValue ? 'fails' : 'fail'} to ${taskName}`;
      }
      return '[Unnameable Chaos Space Bet]';

    case BetType.MainEvent:
      const teamHas1Participant = (team?.participants?.length ?? 0) === 1;

      if (eventBetSubtype === BetSubtype.TeamPosition) {
        return `${getFormattedParticipantList(team?.participants)} ${teamHas1Participant ? 'finishes' : 'finish'} ${numberOfTeams === 1 ? (topBottomOption === 'TOP' ? 'FIRST' : 'LAST') : 'in the ' + topBottomOption + ' ' + numberOfTeams + (teamHas1Participant ? '' : ' teams')} in ${event?.name}`;
      }
      if (eventBetSubtype === BetSubtype.Score) {
        return `${getFormattedParticipantList(team?.participants)} ${teamHas1Participant ? 'gets' : 'get'} ${ouOption} ${ouValue} ${event?.points_label} in ${event?.name}`;
      }
      return '[Unnameable Main Event Bet]';

    case BetType.GameboardMove:
      const gameboardSpaceStartsWithVowel = ['A', 'E', 'I', 'O', 'U'].includes(
        (gameboardSpace?.name ?? 'X').charAt(0).toUpperCase(),
      );
      return `${gameboardPlayer?.display_name} lands on ${gameboardSpaceStartsWithVowel ? 'an' : 'a'} ${gameboardSpace?.name} Space next`;

    default:
      return terms;
  }
}

export function generateBetTypeObject(type: BetType) {
  switch (type) {
    case BetType.DuelWinner:
      return { betType: type, betTypeString: 'Duel Winner' };
    case BetType.SpecialSpaceEvent:
      return {
        betType: type,
        betTypeString: 'Special Space Event Over/Under',
      };
    case BetType.ChaosSpaceEvent:
      return {
        betType: type,
        betTypeString: 'Chaos Space Event',
      };
    case BetType.MainEvent:
      return {
        betType: type,
        betTypeString: 'Main Event',
      };
    case BetType.GameboardMove:
      return {
        betType: type,
        betTypeString: 'Gameboard Move',
      };
    case BetType.Custom:
      return {
        betType: type,
        betTypeString: 'Custom',
      };
  }
}

type DuelWinnerBetDetails = {
  duelId: DuelModel['id'];
  challengerWins: boolean;
};

type SpecialSpaceEventBetDetails = {
  ssEventId: SpecialSpaceEventModel['id'];
  directionIsOver: boolean;
  ouValue: number;
};

type ChaosSpaceEventBetDetails<T extends BetSubtype> =
  T extends BetSubtype.PlayerLoses
    ? ChaosSpaceEventPlayerLosesBetDetails
    : T extends BetSubtype.NumberOfLosers
      ? ChaosSpaceEventNummberOfLosersBetDetails
      : Record<string, never>;

type ChaosSpaceEventPlayerLosesBetDetails = {
  chaosEventId: ChaosSpaceEventModel['id'];
  subtype: BetSubtype.PlayerLoses;
  playerId: number;
  isLoser: boolean;
};

type ChaosSpaceEventNummberOfLosersBetDetails = {
  chaosEventId: ChaosSpaceEventModel['id'];
  subtype: BetSubtype.NumberOfLosers;
  directionIsOver: boolean;
  ouValue: number;
};

type MainEventBetDetails<T extends BetSubtype> =
  T extends BetSubtype.TeamPosition
    ? MainEventTeamPositionBetDetails
    : T extends BetSubtype.Score
      ? MainEventScoreBetDetails
      : Record<string, never>;

type MainEventTeamPositionBetDetails = {
  eventId: EventModel['id'];
  teamId: EventTeamModel['id'];
  subtype: BetSubtype.TeamPosition;
  directionIsTop: boolean;
  numberOfTeams: number;
};

type MainEventScoreBetDetails = {
  eventId: EventModel['id'];
  teamId: EventTeamModel['id'];
  subtype: BetSubtype.Score;
  directionIsOver: boolean;
  ouValue: number;
};

type GameboardMoveBetDetails = {
  playerId: PlayerModel['id'];
  gameboardSpaceId: GameboardSpaceModel['id'];
};

type BetDetails<T extends BetType = BetType> = T extends BetType.DuelWinner
  ? DuelWinnerBetDetails
  : T extends BetType.SpecialSpaceEvent
    ? SpecialSpaceEventBetDetails
    : T extends BetType.ChaosSpaceEvent
      ? ChaosSpaceEventBetDetails<BetSubtype>
      : T extends BetType.MainEvent
        ? MainEventBetDetails<BetSubtype>
        : T extends BetType.GameboardMove
          ? GameboardMoveBetDetails
          : Record<string, never>;
