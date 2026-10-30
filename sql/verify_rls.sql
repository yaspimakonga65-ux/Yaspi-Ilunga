begin;
-- Comptes techniques uniquement dans cette transaction : aucune inscription réelle ni e-mail.
select set_config('subtrack.test_a',gen_random_uuid()::text,true);
select set_config('subtrack.test_b',gen_random_uuid()::text,true);
insert into auth.users(id,email) values(current_setting('subtrack.test_a')::uuid,'subtrack-test-a@example.invalid'),(current_setting('subtrack.test_b')::uuid,'subtrack-test-b@example.invalid');
select set_config('request.jwt.claim.sub',current_setting('subtrack.test_a'),true);
set local role authenticated;
insert into public.workspaces(data) values('{"subscriptions":[],"history":[],"demo":false}');
do $$ begin if (select count(*) from public.workspaces)<>1 then raise exception 'Owner cannot read own data';end if;end $$;
update public.workspaces set data='{"subscriptions":[],"history":[],"demo":false}' where version=1;
do $$ begin if (select version from public.workspaces)<>2 then raise exception 'Version is not incremented';end if;end $$;
-- Une écriture avec l’ancienne version doit toucher zéro ligne.
update public.workspaces set data='{"subscriptions":[],"history":[],"demo":false}' where version=1;
do $$ begin if (select version from public.workspaces)<>2 then raise exception 'Concurrency check failed';end if;end $$;
reset role;
select set_config('request.jwt.claim.sub',current_setting('subtrack.test_b'),true);
set local role authenticated;
do $$ begin if (select count(*) from public.workspaces)<>0 then raise exception 'Cross-user read leaked data';end if;end $$;
-- La seconde identité ne peut pas écrire pour la première.
do $$ begin
 begin
 insert into public.workspaces(user_id,data) values(current_setting('subtrack.test_a')::uuid,'{"subscriptions":[],"history":[]}');
 raise exception 'Cross-user insert allowed';
 exception when insufficient_privilege then null;
 end;
end $$;
reset role;
select not has_table_privilege('anon','public.workspaces','select') as anonymous_read_denied,
not has_table_privilege('authenticated','public.workspaces','delete') as workspace_delete_denied,
true as owner_and_isolation_and_version_tests_passed;
rollback;
