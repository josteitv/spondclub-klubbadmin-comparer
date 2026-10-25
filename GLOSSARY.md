# Spond Club–KlubbAdmin comparer

Finds discrepancies between the Players in the club's Spond Club and the club's official member register in KlubbAdmin.

## Systems

**Spond Club**:
The club's member list in Spond, the app the teams use day to day; the record of who is actually active, across all groups. The club does not use it as its membership system towards NIF.
_Avoid_: Spond (alone), Spond groups

**KlubbAdmin**:
The club's official member register (NIF); the record of who is a registered member.

## People

**Membership manager**:
The club representative (medlemsansvarlig) who runs the comparison and registers Unregistered players in KlubbAdmin.
_Avoid_: Admin, user

**Player**:
An active member of the club in Spond Club, in their own right, registered with member type "Medlem" — not a Guardian, and not someone Spond Club lists as "Ikke medlem". Their Spond groups are an attribute of the Player.
_Avoid_: Participant, Spond member

**Guardian**:
A parent or other contact linked to a Player in Spond Club, typically when the Player is a child.
_Avoid_: Parent, foresatt

**Member**:
A person registered as a member of the club in KlubbAdmin.
_Avoid_: User; and never for people in Spond Club (Spond calls them "members" too)

## Discrepancies

**Unregistered player**:
A Player with no matching Member in KlubbAdmin. Finding these is the tool's main purpose.
_Avoid_: Unregistered participant, missing member, non-member

**Possible match**:
A Player and a Member whose full names are close but not the same, shown for the Membership manager to judge.
_Avoid_: Fuzzy match, near match

**Absent member**:
A Member with no matching Player in Spond Club, whether they were removed from Spond Club or never added.
_Avoid_: Removed member, lapsed member
