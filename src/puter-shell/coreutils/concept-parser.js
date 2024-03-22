define_parser({
    element: a =>
        a.sequence(
            a.choice(a.whitespace(), a.none()),
            a.symbol('value'),
            a.choice(a.whitespace(), a.none()),
        ),
    value: a =>
        a.firstMatch(
            a.sequence(
                a.literal('['),
                a.repeat(
                    a.literal(a.symbol('element')),
                    a.literal(','),
                    { trailing: true },
                )
            ),
            a.sequence(
                a.literal('{'),
                a.repeat(
                    a.sequence(
                        a.symbol('string'),
                        a.literal(':'),
                        a.symbol('value'),
                    ),
                    a.literal(','),
                    { trailing: true },
                )
            ),
        ),
        string: a => new StringParserImpl().
});
