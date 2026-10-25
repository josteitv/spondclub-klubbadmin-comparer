# Spond Club–KlubbAdmin comparer

Finds discrepancies between the Spond Club members and the KlubbAdmin members of a club.

## Systems

**Spond Club**:
The club's member list in Spond, the app the teams use day to day; the record of who is actually active, across all groups. The club does not use it as its membership system towards NIF.
_Avoid_: Spond (alone), Spond groups

**KlubbAdmin**:
The club's official member register (NIF); the record of who is a registered member.

## People

**Membership manager**:
The club representative (medlemsansvarlig) who runs the comparison and registers Unregistered members in KlubbAdmin.
_Avoid_: Admin, user

**Spond Club member**:
A person listed in Spond Club in their own right with member type "Medlem", whatever their age or role (athlete, coach, parent). Not a Guardian, and not someone Spond Club lists as "Ikke medlem". Their Spond groups are an attribute of the Spond Club member.
_Avoid_: Player, participant, Spond member, member (alone)

**KlubbAdmin member**:
A person registered as a member of the club in KlubbAdmin.
_Avoid_: Member (alone), user

**Guardian**:
A parent or other contact linked to a Spond Club member, typically when the Spond Club member is a child.
_Avoid_: Parent, foresatt

## Discrepancies

**Unregistered member**:
A Spond Club member with no matching KlubbAdmin member. Finding these is the tool's main purpose.
_Avoid_: Unregistered player, unregistered participant, missing member, non-member

**Possible match**:
A Spond Club member and a KlubbAdmin member whose full names are close but not the same, shown for the Membership manager to judge.
_Avoid_: Fuzzy match, near match

**KlubbAdmin-only member**:
A KlubbAdmin member with no matching Spond Club member, whether they were removed from Spond Club or never added.
_Avoid_: Absent member, removed member, lapsed member, inactive member
