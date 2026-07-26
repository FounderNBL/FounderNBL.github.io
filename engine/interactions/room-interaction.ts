export type InteractionKind = "look" | "pick";

export interface RoomObjectDefinition {
  id: string;
  sceneId: string;
  name: string;
  description: string;
  canPickUp: boolean;
  pickupMessage?: string;
  tags: string[];
}

export interface TravelerInteractionState {
  travelerId: string;
  lookedAtObjectIds: string[];
  pickedObjectIds: string[];
}

export interface InteractionResult {
  kind: InteractionKind;
  objectId: string;
  message: string;
  state: TravelerInteractionState;
}

function addOnce(items: string[], value: string): string[] {
  return items.includes(value) ? items : [...items, value];
}

export function interactWithRoomObject(
  object: RoomObjectDefinition,
  kind: InteractionKind,
  state: TravelerInteractionState
): InteractionResult {
  if (kind === "look") {
    return {
      kind,
      objectId: object.id,
      message: object.description,
      state: {
        ...state,
        lookedAtObjectIds: addOnce(state.lookedAtObjectIds, object.id)
      }
    };
  }

  if (!object.canPickUp) {
    return {
      kind,
      objectId: object.id,
      message: `${object.name} belongs to the room. You can study it, but you cannot carry it.`,
      state
    };
  }

  return {
    kind,
    objectId: object.id,
    message: object.pickupMessage ?? `You picked up ${object.name}.`,
    state: {
      ...state,
      pickedObjectIds: addOnce(state.pickedObjectIds, object.id)
    }
  };
}
