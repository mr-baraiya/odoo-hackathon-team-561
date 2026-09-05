

update parties p
set balance = (
    select sum(amount) from transactions t
    where t.party_id = p.id
)
where id = 1;
