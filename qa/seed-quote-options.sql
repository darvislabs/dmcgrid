-- Wave 2 addendum: quote options + line items for the 2 seeded quotes (schema-correct)
insert into public.quote_options (id, quote_id, option_name, description, net_cost, currency, is_selected, order_index, day_count)
select ('f1000000-0000-0000-0000-' || lpad((row_number() over (order by q.created_at, o.ord))::text, 12, '0'))::uuid,
       q.id, o.name, o.descr, o.net, 'INR', o.rec, o.ord, o.days
from public.quotes q
cross join (values
  (1, 'Value', '4-star Pattaya + 5-star Bangkok - quality stays at sharp pricing', 141500.00, false, 5),
  (2, 'Comfort', '5-star both cities - the balanced pick most agents sell', 158200.00, true, 5),
  (3, 'Premium', '5-star beachfront + pool villas - top-tier experience', 178900.00, false, 5)
) as o(ord, name, descr, net, rec, days)
where q.status = 'submitted';

insert into public.quote_line_items (id, quote_option_id, day_number, time_window, title, description, cost_category, net_cost)
select ('f2000000-0000-0000-0000-' || lpad((row_number() over (order by opt.quote_id, opt.order_index, l.day))::text, 12, '0'))::uuid,
       opt.id, l.day, l.tw::time_window_type, l.ttl, l.descr, l.cat, l.cost
from public.quote_options opt
cross join (values
  (1, 'morning', 'BKK to Pattaya transfer', 'Private AC coach with English-speaking driver', 'transfer', 4500.00),
  (1, 'afternoon', 'Pattaya hotel check-in', '2N deluxe city-view room with breakfast', 'stay', 9200.00),
  (2, 'morning', 'Coral Island excursion', 'Speedboat both ways + seafood lunch', 'activity', 3800.00),
  (3, 'morning', 'Pattaya to Bangkok transfer', 'Private AC coach, en-route Indian dinner', 'transfer', 3200.00),
  (4, 'afternoon', 'Bangkok hotel check-in', '3N superior room with breakfast', 'stay', 11800.00),
  (5, 'evening', 'Alcazar show + temple tour', 'VIP seats + Wat Pho and Grand Palace', 'activity', 5400.00)
) as l(day, tw, ttl, descr, cat, cost);
